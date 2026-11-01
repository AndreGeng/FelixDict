#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "$0")"

if [[ "${1:-}" == "--action" && "${2:-}" == "felixdict:node-install-help" ]]; then
  exec /usr/bin/open 'https://www.alfredapp.com/help/kb/install-dependencies/'
fi

runtime="${node_path:-}"
if [[ -z "$runtime" ]]; then
  for candidate in "$HOME/.local/bin/node" /opt/homebrew/bin/node /usr/local/bin/node; do
    if [[ -x "$candidate" ]]; then
      runtime="$candidate"
      break
    fi
  done
fi
if [[ -z "$runtime" ]]; then
  runtime="$(command -v node || true)"
fi
if [[ -z "$runtime" || ! -x "$runtime" ]]; then
  if [[ -n "${node_path:-}" ]]; then
    echo '{"items":[{"title":"Node.js 路径无效","subtitle":"请在 Configure Workflow 中修正 node_path，或清空以自动检测","valid":false}]}'
  else
    echo '{"items":[{"title":"需要安装 Node.js 18+","subtitle":"按回车打开 Alfred 官方安装指引；安装后重新查询","arg":"felixdict:node-install-help","valid":true,"mods":{"cmd":{"valid":false}}}]}'
  fi
  exit 0
fi
exec "$runtime" dist/cli.js "$@"
