#!/usr/bin/env bash
set -euo pipefail
grep -RIn --include='*.html' --include='*.ts' '\|\s*transloco\s*:\s*\{\s*\}\s*:\s*\{[^}]*scope' "$(dirname "$0")/.." && {
  echo "❌ Found invalid Transloco pipe usage."
  exit 1
} || {
  echo "✅ Transloco usage check passed."
}
