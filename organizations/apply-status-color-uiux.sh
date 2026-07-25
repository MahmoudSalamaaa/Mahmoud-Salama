#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")"
python3 apply_status_color_uiux.py "$@"
