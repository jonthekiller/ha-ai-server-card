#!/bin/bash
# Returns AI backend metrics (vLLM, SGLang, or ds4-server) in HA-compatible JSON:
#   {"running":N,"waiting":N,"ttft":N,"itl":N,"tokens":N,"ctx":N,"model":"...","uptime":N,"status":"healthy"}
# Pure shell — no Python, no broken awk gsub
# Usage: llm_metrics.sh <port> [model_name] [docker_container_name] [model_dir]
#   docker_container_name: optional, enables Docker health-based status detection
#   model_dir: optional, path to model directory for PID file (defaults to /home/jonthekiller/docker/models/${MODEL}/)
#
# Status values (matching user's status script):
#   "starting"   — PID file exists with live process, or Docker health=starting/unhealthy
#   "healthy"    — Docker container running and healthy (or no healthcheck)
#   "stopped"    — Docker container not found or not running
#   "unhealthy"  — Docker healthcheck reports error

PORT=${1:-10002}
MODEL=${2:-}
CONTAINER=${3:-}
MODEL_DIR=${4:-/home/jonthekiller/docker/models/${MODEL}/}

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

# ── Helper: extract value from vLLM metrics line ──────────
# vLLM format: vllm:metric_name{labels} value
# Returns the last line matching the pattern, extracts value after the closing brace
extract_vllm() {
  local pattern=$1
  echo "$RAW" | grep "$pattern" | tail -1 | sed 's/.*} //'
}

# ── Health check ──────────────────────────────────────────
RAW=$($SSH "curl -s --max-time 5 localhost:${PORT}/metrics" 2>/dev/null)
if [ -z "$RAW" ]; then
  STATUS=$(detect_status $PORT)
  echo "{\"running\":0,\"waiting\":0,\"ttft\":0,\"itl\":0,\"tokens\":0,\"ctx\":0,\"model\":\"unknown\",\"uptime\":0,\"status\":\"${STATUS}\"}"
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

  RUNNING=$(extract_vllm '^vllm:num_requests_running{')
  WAITING=$(extract_vllm '^vllm:num_requests_waiting{')
  TTFT_SUM=$(extract_vllm '^vllm:time_to_first_token_seconds_sum{')
  TTFT_COUNT=$(extract_vllm '^vllm:time_to_first_token_seconds_count{')
  ITL_SUM=$(extract_vllm '^vllm:request_time_per_output_token_seconds_sum{')
  ITL_COUNT=$(extract_vllm '^vllm:request_time_per_output_token_seconds_count{')
  # iteration_tokens_total is a histogram — use the max bucket (inf)
  TOKENS=$(extract_vllm '^vllm:iteration_tokens_total_bucket{le="inf"}')

  RUNNING=${RUNNING:-0}
  WAITING=${WAITING:-0}
  TTFT_MS=0
  ITL_MS=0
  CTX=0

  if [ -n "$TTFT_COUNT" ] && [ "$TTFT_COUNT" != "0" ]; then
    TTFT_MS=$(awk "BEGIN {printf \"%d\", $TTFT_SUM / $TTFT_COUNT * 1000}")
  fi
  if [ -n "$ITL_COUNT" ] && [ "$ITL_COUNT" != "0" ]; then
    ITL_MS=$(awk "BEGIN {printf \"%d\", $ITL_SUM / $ITL_COUNT * 1000}")
    if [ "$ITL_MS" -gt 0 ]; then
      CTX=$(awk "BEGIN {printf \"%d\", 1000 / $ITL_MS}")
    fi
  fi

  STATUS=$(detect_status $PORT)
  echo "{\"running\":${RUNNING},\"waiting\":${WAITING},\"ttft\":${TTFT_MS},\"itl\":${ITL_MS},\"tokens\":${TOKENS:-0},\"ctx\":${CTX},\"model\":\"${CLEAN_MODEL}\",\"uptime\":${UPTIME},\"status\":\"${STATUS}\"}"
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

  RUNNING=$(echo "$RAW" | grep 'sglang:num_running_reqs' | awk '{print $2}')
  WAITING=$(echo "$RAW" | grep 'sglang:num_queue_reqs' | awk '{print $2}')
  TTFT_SUM=$(echo "$RAW" | grep 'sglang:time_to_first_token_seconds_sum' | awk '{print $2}')
  TTFT_COUNT=$(echo "$RAW" | grep 'sglang:time_to_first_token_seconds_count' | awk '{print $2}')
  ITL_SUM=$(echo "$RAW" | grep 'sglang:time_per_output_token_seconds_sum' | awk '{print $2}')
  ITL_COUNT=$(echo "$RAW" | grep 'sglang:time_per_output_token_seconds_count' | awk '{print $2}')

  RUNNING=${RUNNING:-0}
  WAITING=${WAITING:-0}
  TTFT_MS=0
  ITL_MS=0
  CTX=0

  if [ -n "$TTFT_COUNT" ] && [ "$TTFT_COUNT" != "0" ]; then
    TTFT_MS=$(awk "BEGIN {printf \"%d\", $TTFT_SUM / $TTFT_COUNT * 1000}")
  fi
  if [ -n "$ITL_COUNT" ] && [ "$ITL_COUNT" != "0" ]; then
    ITL_MS=$(awk "BEGIN {printf \"%d\", $ITL_SUM / $ITL_COUNT * 1000}")
    if [ "$ITL_MS" -gt 0 ]; then
      CTX=$(awk "BEGIN {printf \"%d\", 1000 / $ITL_MS}")
    fi
  fi

  STATUS=$(detect_status $PORT)
  echo "{\"running\":${RUNNING},\"waiting\":${WAITING},\"ttft\":${TTFT_MS},\"itl\":${ITL_MS},\"tokens\":0,\"ctx\":${CTX},\"model\":\"${CLEAN_MODEL}\",\"uptime\":${UPTIME},\"status\":\"${STATUS}\"}"
  exit 0
fi

# ── ds4-server ────────────────────────────────────────────
if echo "$RAW" | grep -q '^ds4_'; then
  DS_MODEL=$($SSH "curl -s --max-time 3 localhost:${PORT}/v1/models" 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  CLEAN_MODEL=$(echo "${DS_MODEL:-unknown}" | sed 's/\\/\\\\/g; s/"/\\"/g')

  DS_START=$(echo "$RAW" | grep '^process_start_time_seconds' | awk '{print $2}')
  DS_NOW=$(date +%s)
  DS_UPTIME=0
  if [ -n "$DS_START" ]; then
    DS_EPOCH=$(echo "$DS_START" | awk '{printf "%d", $1}')
    DS_UPTIME=$(( DS_NOW - DS_EPOCH ))
  fi

  DS_RUNNING=$(echo "$RAW" | grep '^ds4_requests_inflight' | awk '{print $2}')
  DS_DECODE=$(echo "$RAW" | grep '^ds4_decode_tok_s' | awk '{print $2}')
  DS_PER_STEP=$(echo "$RAW" | grep '^ds4_tok_per_step' | awk '{print $2}')

  DS_RUNNING=${DS_RUNNING:-0}
  ITL_MS=0
  if [ -n "$DS_DECODE" ] && [ "$DS_DECODE" != "0" ]; then
    ITL_MS=$(( 1000 / DS_DECODE ))
  fi

  STATUS=$(detect_status $PORT)
  echo "{\"running\":${DS_RUNNING},\"waiting\":0,\"ttft\":0,\"itl\":${ITL_MS},\"tokens\":${DS_PER_STEP:-0},\"ctx\":0,\"model\":\"${CLEAN_MODEL}\",\"uptime\":${DS_UPTIME},\"status\":\"${STATUS}\"}"
  exit 0
fi

# ── Unknown ───────────────────────────────────────────────
STATUS=$(detect_status $PORT)
echo "{\"running\":0,\"waiting\":0,\"ttft\":0,\"itl\":0,\"tokens\":0,\"ctx\":0,\"model\":\"unknown\",\"uptime\":0,\"status\":\"${STATUS}\"}"
