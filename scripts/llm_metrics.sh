#!/bin/bash
# Returns AI backend metrics (vLLM, SGLang, or ds4-server) in HA-compatible JSON:
#   {"running":N,"waiting":N,"ttft":N,"itl":N,"tps":N,"model":"...","uptime":N,"status":"healthy"}
# tps = live generation rate in tok/s (delta of the cumulative generation
# tokens counter between two polls, 0 when idle)
# Pure shell — no Python, no broken awk gsub
# Usage: llm_metrics.sh <port> [model_name] [docker_container_name] [model_dir]
#   docker_container_name: optional, enables Docker health-based status detection
#   model_dir: optional, path to model directory for PID file (defaults to ${MODEL}/)
#
# Status values (matching user's status script):
#   "starting"   — PID file exists with live process, or Docker health=starting/unhealthy
#   "healthy"    — Docker container running and healthy (or no healthcheck)
#   "stopped"    — Docker container not found or not running
#   "unhealthy"  — Docker healthcheck reports error

PORT=${1:-10002}
MODEL=${2:-}
CONTAINER=${3:-}
MODEL_DIR=${4:-${MODEL}/}

SSH="ssh -i /config/ssh_ai_server -o StrictHostKeyChecking=no -o ConnectTimeout=3 USER@AI-SERVER-HOST"

# ── Status detection ──────────────────────────────────────
detect_status() {
  local port=$1

  # If container name provided, use Docker-based status
  if [ -n "$CONTAINER" ]; then
    # Check PID file first (starting)
    local pidfile="${MODEL_DIR}.vllm.pid"
    if [ -f "$pidfile" ]; then
      local pid
      pid=$(cat "$pidfile" 2>/dev/null || true)
      if [ -n "$pid" ] && $SSH "kill -0 $pid 2>/dev/null"; then
        echo "starting"
        return
      fi
      # Stale PID file — remove it
      $SSH "rm -f $pidfile" 2>/dev/null
    fi

    # Check Docker container existence and state
    local docker_state
    docker_state=$($SSH "sudo docker inspect --format '{{.State.Status}}' $CONTAINER 2>/dev/null || echo 'not_found'")
    if [ "$docker_state" = "running" ]; then
      # Container is running — check health
      local health
      health=$($SSH "sudo docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' $CONTAINER 2>/dev/null || echo 'error'")
      case "$health" in
        healthy) echo "healthy" ;;
        starting|unhealthy) echo "starting" ;;
        none) echo "healthy" ;;
        *) echo "unhealthy" ;;
      esac
      return
    fi

    # Docker inspect failed or container not found — fallback to curl
    if $SSH "curl -s --max-time 3 localhost:${port}/metrics" >/dev/null 2>&1; then
      echo "healthy"
    else
      echo "stopped"
    fi
    return
  fi

  # No container: fall back to curl-based status
  if $SSH "curl -s --max-time 3 localhost:${port}/metrics" >/dev/null 2>&1; then
    echo "healthy"
  else
    echo "stopped"
  fi
}

# ── Helper: extract value from a Prometheus metric line (vLLM) ──
# vLLM exposes "name value" (older versions) or "name{labels} value" (current
# versions label every metric with model_name). Match "^name" followed by a
# space, {, or end-of-line; return the sum of all matching series ($2).
extract_vllm() {
  local name=$1
  echo "$RAW" | grep -E "^${name}([ {]|$)" | awk '{s += $2} END {if (NR > 0 && s != "") print s}'
}

# ── Helper: live generation rate (tok/s) ──────────────────
# Live rate = Δ(cumulative generation_tokens_total) / Δt between sensor polls.
# State kept in /tmp/llm_metrics_<port>.state as "<epoch> <cumulative_tokens>".
# Idle → 0. Counter reset (server restart) or stale state (>120s) → 0.
# Usage: live_gen_tps <port> <current_total>
live_gen_tps() {
  local port=$1 cur=$2
  local state="/tmp/llm_metrics_${port}.state"
  local now ts prev_tok rate=0
  now=$(date +%s)
  if [ -n "$cur" ] && [ -f "$state" ]; then
    read -r ts prev_tok < "$state"
    if [ -n "$ts" ] && [ -n "$prev_tok" ]; then
      rate=$(awk -v c="$cur" -v p="$prev_tok" -v n="$now" -v t="$ts" 'BEGIN {
        dt = n - t
        if (dt > 0 && dt <= 120 && c >= p) printf "%d", int((c - p) / dt)
        else printf "0"
      }')
    fi
  fi
  if [ -n "$cur" ]; then
    echo "${now} ${cur}" > "$state"
  fi
  echo "$rate"
}

# ── Health check ──────────────────────────────────────────
RAW=$($SSH "curl -s --max-time 5 localhost:${PORT}/metrics" 2>/dev/null)
if [ -z "$RAW" ]; then
  STATUS=$(detect_status $PORT)
  echo "{\"running\":0,\"waiting\":0,\"ttft\":0,\"itl\":0,\"tps\":0,\"model\":\"unknown\",\"uptime\":0,\"status\":\"${STATUS}\"}"
  exit 0
fi

# ── vLLM ──────────────────────────────────────────────────
if echo "$RAW" | grep -q '^vllm:'; then
  SVC_MODEL=$($SSH "curl -s --max-time 3 localhost:${PORT}/v1/models" 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  CLEAN_MODEL=$(echo "${SVC_MODEL:-unknown}" | sed 's/\\/\\\\/g; s/"/\\"/g')

  START_TIME=$(echo "$RAW" | grep '^process_start_time_seconds' | awk '{print $2}')
  NOW=$(date +%s)
  UPTIME=0
  if [ -n "$START_TIME" ]; then
    START_EPOCH=$(echo "$START_TIME" | awk '{printf "%d", $1}')
    UPTIME=$(( NOW - START_EPOCH ))
  fi

  RUNNING=$(extract_vllm 'vllm:num_requests_running')
  WAITING=$(extract_vllm 'vllm:num_requests_waiting')
  TTFT_SUM=$(extract_vllm 'vllm:time_to_first_token_seconds_sum')
  TTFT_COUNT=$(extract_vllm 'vllm:time_to_first_token_seconds_count')
  # ITL: prefer inter_token_latency_seconds (current), fall back to the
  # legacy request_time_per_output_token_seconds
  ITL_SUM=$(extract_vllm 'vllm:inter_token_latency_seconds_sum')
  ITL_COUNT=$(extract_vllm 'vllm:inter_token_latency_seconds_count')
  if [ -z "$ITL_SUM" ]; then
    ITL_SUM=$(extract_vllm 'vllm:request_time_per_output_token_seconds_sum')
    ITL_COUNT=$(extract_vllm 'vllm:request_time_per_output_token_seconds_count')
  fi
  GEN_TOKENS=$(extract_vllm 'vllm:generation_tokens_total')

  RUNNING=${RUNNING:-0}
  WAITING=${WAITING:-0}
  TTFT_MS=0
  ITL_MS=0
  TPS=0

  if [ -n "$TTFT_COUNT" ] && [ "$TTFT_COUNT" != "0" ]; then
    TTFT_MS=$(awk "BEGIN {printf \"%d\", $TTFT_SUM / $TTFT_COUNT * 1000}")
  fi
  if [ -n "$ITL_COUNT" ] && [ "$ITL_COUNT" != "0" ]; then
    ITL_MS=$(awk "BEGIN {printf \"%d\", $ITL_SUM / $ITL_COUNT * 1000}")
  fi
  # tps = live generation tok/s (Δ total generation tokens between polls, 0 when idle)
  TPS=$(live_gen_tps "$PORT" "$GEN_TOKENS")

  STATUS=$(detect_status $PORT)
  echo "{\"running\":${RUNNING},\"waiting\":${WAITING},\"ttft\":${TTFT_MS},\"itl\":${ITL_MS},\"tps\":${TPS},\"model\":\"${CLEAN_MODEL}\",\"uptime\":${UPTIME},\"status\":\"${STATUS}\"}"
  exit 0
fi

# ── SGLang ────────────────────────────────────────────────
if echo "$RAW" | grep -q '^sglang:'; then
  SVC_MODEL=$($SSH "curl -s --max-time 3 localhost:${PORT}/v1/models" 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  CLEAN_MODEL=$(echo "${SVC_MODEL:-unknown}" | sed 's/\\/\\\\/g; s/"/\\"/g')

  START_TIME=$(echo "$RAW" | grep '^process_start_time_seconds' | awk '{print $2}')
  NOW=$(date +%s)
  UPTIME=0
  if [ -n "$START_TIME" ]; then
    START_EPOCH=$(echo "$START_TIME" | awk '{printf "%d", $1}')
    UPTIME=$(( NOW - START_EPOCH ))
  fi

  RUNNING=$(echo "$RAW" | grep '^sglang:num_running_reqs' | awk '{print $2}' | head -1)
  WAITING=$(echo "$RAW" | grep '^sglang:num_queue_reqs' | awk '{print $2}' | head -1)
  TTFT_SUM=$(echo "$RAW" | grep '^sglang:time_to_first_token_seconds_sum' | awk '{print $2}' | head -1)
  TTFT_COUNT=$(echo "$RAW" | grep '^sglang:time_to_first_token_seconds_count' | awk '{print $2}' | head -1)
  ITL_SUM=$(echo "$RAW" | grep '^sglang:inter_token_latency_seconds_sum' | awk '{print $2}' | head -1)
  ITL_COUNT=$(echo "$RAW" | grep '^sglang:inter_token_latency_seconds_count' | awk '{print $2}' | head -1)
  GEN_TOKENS=$(echo "$RAW" | grep '^sglang:generation_tokens_total' | awk '{s+=$2} END{print s}')

  RUNNING=${RUNNING:-0}
  WAITING=${WAITING:-0}
  TTFT_MS=0
  ITL_MS=0
  TPS=0

  if [ -n "$TTFT_COUNT" ] && [ "$TTFT_COUNT" != "0" ]; then
    TTFT_MS=$(awk "BEGIN {printf \"%d\", $TTFT_SUM / $TTFT_COUNT * 1000}")
  fi
  if [ -n "$ITL_COUNT" ] && [ "$ITL_COUNT" != "0" ]; then
    ITL_MS=$(awk "BEGIN {printf \"%d\", $ITL_SUM / $ITL_COUNT * 1000}")
  fi
  # tps = live generation tok/s (Δ total generation tokens between polls, 0 when idle)
  TPS=$(live_gen_tps "$PORT" "$GEN_TOKENS")

  STATUS=$(detect_status $PORT)
  echo "{\"running\":${RUNNING},\"waiting\":${WAITING},\"ttft\":${TTFT_MS},\"itl\":${ITL_MS},\"tps\":${TPS},\"model\":\"${CLEAN_MODEL}\",\"uptime\":${UPTIME},\"status\":\"${STATUS}\"}"
  exit 0
fi

# ── ds4-server ────────────────────────────────────────────
if echo "$RAW" | grep -q '^ds4_'; then
  DS_MODEL=$($SSH "curl -s --max-time 3 localhost:${PORT}/v1/models" 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  CLEAN_MODEL=$(echo "${DS_MODEL:-unknown}" | sed 's/\\/\\\\/g; s/"/\\"/g')

  DS_UPTIME=$(echo "$RAW" | grep -E '^ds4_uptime_seconds([ {]|$)' | awk '{s += $2} END {if (NR > 0 && s != "") printf "%d", s}')
  DS_RUNNING=$(echo "$RAW" | grep -E '^ds4_requests_inflight([ {]|$)' | awk '{s += $2} END {if (NR > 0 && s != "") print s}')
  # Live rate from the cumulative decoded-tokens counter (idle → 0)
  DS_DECODED=$(echo "$RAW" | grep -E '^ds4_tokens_decoded_total([ {]|$)' | awk '{s += $2} END {if (NR > 0 && s != "") print s}')
  # ~60s window gauges: only trustworthy while a request is in flight
  DS_DECODE=$(echo "$RAW" | grep -E '^ds4_decode_tok_s([ {]|$)' | awk '{s += $2} END {if (NR > 0 && s != "") print s}')

  DS_RUNNING=${DS_RUNNING:-0}
  ITL_MS=0
  if [ "$(awk -v r="${DS_RUNNING:-0}" 'BEGIN {print (r > 0) ? 1 : 0}')" = "1" ] && [ -n "$DS_DECODE" ]; then
    ITL_MS=$(awk -v d="$DS_DECODE" 'BEGIN {if (d > 0) printf "%d", 1000 / d; else print 0}')
  fi
  TPS=$(live_gen_tps "$PORT" "$DS_DECODED")

  STATUS=$(detect_status $PORT)
  echo "{\"running\":${DS_RUNNING},\"waiting\":0,\"ttft\":0,\"itl\":${ITL_MS},\"tps\":${TPS},\"model\":\"${CLEAN_MODEL}\",\"uptime\":${DS_UPTIME:-0},\"status\":\"${STATUS}\"}"
  exit 0
fi

# ── Unknown ───────────────────────────────────────────────
STATUS=$(detect_status $PORT)
echo "{\"running\":0,\"waiting\":0,\"ttft\":0,\"itl\":0,\"tps\":0,\"model\":\"unknown\",\"uptime\":0,\"status\":\"${STATUS}\"}"
