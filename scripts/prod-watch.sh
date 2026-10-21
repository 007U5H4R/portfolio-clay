#!/usr/bin/env bash
# TASK-329: production smoke check. Each page must return HTTP 200 and carry its <title> marker.
# One retry after RETRY_DELAY seconds (default 60) before failing, so a single blip never alerts.
# Usage: BASE_URL=https://tusharpathak.com scripts/prod-watch.sh
set -u
BASE_URL="${BASE_URL:-https://tusharpathak.com}"
RETRY_DELAY="${RETRY_DELAY:-60}"

# path|marker (the page <title>, stable across deploys)
CHECKS=(
  "/|Tushar Pathak · Senior Product Manager"
  "/projects|Portfolio · Tushar Pathak"
  "/about|About · Tushar Pathak"
  "/work/teachspark|TeachSpark · Tushar Pathak"
)

check_all() {
  local failed=0 path marker code body
  for entry in "${CHECKS[@]}"; do
    path="${entry%%|*}"; marker="${entry#*|}"
    body="$(mktemp)"
    code="$(curl -sS -m 30 -o "$body" -w '%{http_code}' "$BASE_URL$path" 2>&1)" || code="curl-error"
    if [ "$code" != "200" ]; then
      echo "FAIL $path: HTTP $code"; failed=1
    elif ! grep -qF "$marker" "$body"; then
      echo "FAIL $path: HTTP 200 but marker missing: $marker"; failed=1
    else
      echo "ok   $path"
    fi
    rm -f "$body"
  done
  return $failed
}

if check_all; then exit 0; fi
echo "First attempt failed; retrying in ${RETRY_DELAY}s"
sleep "$RETRY_DELAY"
check_all
