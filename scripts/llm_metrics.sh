#!/bin/bash
#
# Returns AI backend metrics (vLLM or ds4-server) in HA-compatible JSON:
#   {"running":N,"waiting":N,"ttft":N,"itl":N,"tokens":N,"model":"...","uptime":...}
#
# Auto-detects backend on the given port:
#   - vLLM       (ports 10001/10002): vllm:* / num_requests_* metrics, filtered by model_name
#   - ds4-server (port 10003):        ds4_* metrics, no per-model filtering (global)
#
# ds4-server mapping to neutral schema:
#   running  = ds4_requests_inflight            (requests in flight)
#   waiting  = 0                                (no queue metric available)
#   ttft     = 0                                (no TTFT histogram exposed)
#   itl      = 1000 / ds4_decode_tok_s          (ms per token, derived from decode rate)
#   tokens   = ds4_tok_per_step                 (tokens per step == Tok/Iter)

PORT=$1
MODEL=${2//\'/}   # strip quotes: HA passes 'Qwen3.6-27B'

RAW=$(ssh -i /config/ssh_ai_server -o StrictHostKeyChecking=no USER@AI-SERVER-HOST \
  "curl -s --max-time 5 localhost:${PORT}/metrics")

# ── vLLM ──────────────────────────────────────────────────
if echo "$RAW" | grep -q 'num_requests_running\|^vllm:'; then
  # Get model from /v1/models endpoint
  SVC_MODEL=$(ssh -i /config/ssh_ai_server -o StrictHostKeyChecking=no USER@AI-SERVER-HOST \
    "curl -s --max-time 5 localhost:${PORT}/v1/models" 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

  # Get process_start_time from metrics to derive uptime
  START_TIME=$(echo "$RAW" | grep '^process_start_time_seconds' | awk '{print $2}')
  NOW=$(date +%s)
  UPTIME=0
  if [ -n "$START_TIME" ]; then
    # Handle scientific notation (1.78594131134e+09)
    START_EPOCH=$(python3 -c "print(int($START_TIME))" 2>/dev/null || echo "$NOW")
    UPTIME=$(( NOW - START_EPOCH ))
  fi

  echo "$RAW" | grep "${MODEL}" | awk -v model="$SVC_MODEL" -v uptime="$UPTIME" '
    BEGIN { r=0; w=0; ts=0; tn=0; os=0; on=0; tok=0; kv=0 }
    /num_requests_running/      { r=$2 }
    /num_requests_waiting/      { w=$2 }
    /time_to_first_token_seconds_sum/   { ts=$2 }
    /time_to_first_token_seconds_count/ { tn=$2 }
    /time_per_output_token_seconds_sum/ { os=$2 }
    /time_per_output_token_seconds_count/{ on=$2 }
    /iteration_tokens_total_sum/        { tok=$2 }
    /vllm:kv_cache_usage_perc/          { kv=$NF }
    END {
      ttft=(tn>0 ? ts/tn*1000 : 0);
      itl=(on>0 ? os/on*1000 : 0);
      ctx=(itl>0 ? 1000/itl : 0);
      clean_model=(model != "" ? model : "unknown");
      gsub(/"/, "\\\"", clean_model);
      printf "{\"running\":%d,\"waiting\":%d,\"ttft\":%.0f,\"itl\":%.0f,\"tokens\":%s,\"ctx\":%.0f,\"model\":\"%s\",\"uptime\":%d}\n", r, w, ttft, itl, (itl>0 ? 1000/itl : 0), ctx, clean_model, uptime
    }'
  exit 0
fi

# ── ds4-server ────────────────────────────────────────────
# Get model from /v1/models endpoint
DModel=$(ssh -i /config/ssh_ai_server -o StrictHostKeyChecking=no USER@AI-SERVER-HOST \
  "curl -s --max-time 5 localhost:${PORT}/v1/models" 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

# Get uptime from process_start_time or ps aux
DS4_UPTIME=0
START_TIME=$(echo "$RAW" | grep '^process_start_time_seconds' | awk '{print $2}')
if [ -z "$START_TIME" ]; then
  # Fallback: pgrep + stat /proc
  PID=$(pgrep -f "ds4-server.*--port ${PORT}" 2>/dev/null || echo "")
  if [ -n "$PID" ]; then
    START_TIME=$(date -d "$(stat -c %Y /proc/$PID 2>/dev/null)" +%s 2>/dev/null || echo "")
  fi
fi
NOW=$(date +%s)
if [ -n "$START_TIME" ] && [ "$START_TIME" -gt 0 ] 2>/dev/null; then
  DS4_UPTIME=$(( NOW - START_TIME ))
fi

echo "$RAW" | awk -v model="$DModel" -v uptime="$DS4_UPTIME" '
  BEGIN { r=0; w=0; dec=0; tok=0; kv=0 }
  /ds4_requests_inflight/ { r=$2 }
  /ds4_decode_tok_s/      { dec=$2 }
  /ds4_tok_per_step/      { tok=$2 }
  /ds4_kv_cache_usage/    { kv=$2 }
  END {
    itl=(dec>0 ? 1000/dec : 0);
    clean_model=(model != "" ? model : "unknown");
    gsub(/"/, "\\\"", clean_model);
    printf "{\"running\":%d,\"waiting\":%d,\"ttft\":0,\"itl\":%.0f,\"tokens\":%.0f,\"ctx\":%.0f,\"model\":\"%s\",\"uptime\":%d}\n", r, w, itl, dec, kv*100, clean_model, uptime
  }'
