# Source this file to pin all browser/temp tooling to the E Drive (global scar guard).
# Everything Claude-related — Playwright browsers, temp files — stays off the Mac internal disk.
export PLAYWRIGHT_BROWSERS_PATH="/Volumes/E Drive/Dev/.cache/ms-playwright"
export TMPDIR="/Volumes/E Drive/Dev/.scratch/tmp"
export LHCI_DIR=".lighthouseci"

mkdir -p "$PLAYWRIGHT_BROWSERS_PATH"
mkdir -p "$TMPDIR"
