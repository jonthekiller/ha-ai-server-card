#!/bin/bash
# Returns AI backend metrics (vLLM, SGLang, or ds4-server) in HA-compatible JSON:
#   {"running":N,"waiting":N,"ttft":N,"itl":N,"tokens":N,"model":"...","uptime":...}
# Auto-detects backend on the given port:
#   - vLLM       (ports 10001/10002): vllm:* / num_requests_* metrics, filtered by model_name
#   - SGLang:    sglang: metrics with model_name label filtering
#   - ds4-server (port 10003):        ds4_* metrics, no per-model filtering (global)
#   - SGLang fallback:                /get_server_info — extracts throughput + model

PORT=$1
MODEL=${2//\'/}   # strip quotes: HA passes 'Qwen3.6-27B'

SSH="ssh -i /config/ssh_ai_server -o StrictHostKeyChecking=no USER@AI-SERVER-HOST"

RAW=$($SSH "curl -s --max-time 5 localhost:${PORT}/metrics")
SVC_RESPONSE=$($SSH "curl -s --max-time 5 localhost:${PORT}/get_server_info" 2>/dev/null)

# ── vLLM ──────────────────────────────────────────────────
if echo "$RAW" | grep -q 'num_requests_running\|^vllm:'; then
  SVC_MODEL=$($SSH "curl -s --max-time 5 localhost:${PORT}/v1/models" 2>/dev/null | grep -o '"\\\\id":"[^"]*"' | head -1 | cut -d'"' -f4)
  START_TIME=$(echo "$RAW" | grep '^process_start_time_seconds' | awk '{print $2}')
  NOW=$(date +%s)
  UPTIME=0
  if [ -n "$START_TIME" ]; then
    START_EPOCH=$(python3 -c "print(int($START_TIME))" 2>/dev/null || echo "$NOW")
    UPTIME=$(( NOW - START_EPOCH ))
  fi
  # Use Python helper to parse metrics and clean model name
  METRICS=$($SSH "python3 /config/scripts/llm_metrics.py $PORT '\$SVC_MODEL'")
  echo "$METRICS"
  exit 0
fi

# ── SGLang ────────────────────────────────────────────────
if echo "$RAW" | grep -q 'sglang:num_running_reqs\|^sglang:'; then
  SVC_MODEL=$($SSH "curl -s --max-time 5 localhost:${PORT}/v1/models" 2>/dev/null | grep -o '"\\\\id":"[^"]*"' | head -1 | cut -d'"' -f4)
  SG_START=$(echo "$RAW" | grep '^process_start_time_seconds' | awk '{print $2}')
  SG_NOW=$(date +%s)
  SG_UPTIME=0
  if [ -n "$SG_START" ]; then
    SG_START_EPOCH=$(python3 -c "print(int($SG_START))" 2>/dev/null || echo "$SG_NOW")
    SG_UPTIME=$(( SG_NOW - SG_START_EPOCH ))
  fi
  # Use Python helper to parse metrics
  METRICS=$($SSH "python3 /config/scripts/llm_metrics.py $PORT '\$SVC_MODEL'")
  echo "$METRICS"
  exit 0
fi

# ── ds4-server ────────────────────────────────────────────
DSModel=$($SSH "curl -s --max-time 5 localhost:${PORT}/v1/models" 2>/dev/null | grep -o '"\\\\id":"[^"]*"' | head -1 | cut -d'"' -f4)
DS4_UPTIME=0
DS4_START=$(echo "$RAW" | grep '^process_start_time_seconds' | awk '{print $2}')
if [ -z "$DS4_START" ]; then
  PID=$(pgrep -f "ds4-server.*--port ${PORT}" 2>/dev/null || echo "")
  if [ -n "$PID" ]; then
    DS4_START=$(date -d "$(stat -c %Y /proc/$PID 2>/dev/null)" +%s 2>/dev/null || echo "")
  fi
fi
DS4_NOW=$(date +%s)
if [ -n "$DS4_START" ] && [ "$DS4_START" -gt 0 ] 2>/dev/null; then
  DS4_UPTIME=$(( DS4_NOW - DS4_START ))
fi
if echo "$RAW" | grep -q '^ds4_'; then
  # Use Python helper to parse metrics
  METRICS=$($SSH "python3 /config/scripts/llm_metrics.py $PORT '\$DSModel'")
  echo "$METRICS"
  exit 0
fi

# ── SGLang fallback /get_server_info ──────────────────────
if [ -n "$SVC_RESPONSE" ] && echo "$SVC_RESPONSE" | grep -q 'model_name'; then
  python3 -c "import json, sys; d = json.loads(sys.argv[1]); gen_tp = float(d.get('last_gen_throughput', 0) or 0); prefill_tp = float(d.get('last_prefill_throughput', 0) or 0); model = d.get('model_name', 'unknown'); itl = 1000 / gen_tp if gen_tp > 0 else 0; tokens = gen_tp + prefill_tp; print(json.dumps({'running': 0, 'waiting': 0, 'ttft': 0, 'itl': round(itl), 'tokens': round(tokens), 'ctx': round(tokens), 'model': model, 'uptime': 0}))" "$SVC_RESPONSE"
  exit 0
fi

# ── Unknown backend ───────────────────────────────────────
echo '{"running":0,"waiting":0,"ttft":0,"itl":0,"tokens":0,"ctx":0,"model":"unknown","uptime":0}'
