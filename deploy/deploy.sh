#!/usr/bin/env bash
set -Eeuo pipefail

readonly commit_sha="${1:-}"
readonly web_archive="${2:-}"
readonly repo_dir="/home/nmfairus/gc-web"
readonly web_root="/var/www/gc-web"
readonly release_dir="$web_root/releases/$commit_sha"

if [[ ! "$commit_sha" =~ ^[0-9a-f]{40}$ ]]; then
  echo "Usage: deploy.sh <40-character-commit-sha> <web-archive>" >&2
  exit 2
fi

if [[ -z "$web_archive" || ! -f "$web_archive" ]]; then
  echo "Web archive is required" >&2
  exit 2
fi

cd "$repo_dir"
git fetch --quiet origin main
git cat-file -e "${commit_sha}^{commit}"
git checkout --quiet --force --detach "$commit_sha"

sudo install -d -o root -g caddy -m 0750 "$web_root" "$web_root/releases"
sudo rm -rf "$release_dir"
sudo install -d -o root -g caddy -m 0750 "$release_dir"
sudo tar -xzf "$web_archive" -C "$release_dir"
sudo chown -R root:caddy "$release_dir"
sudo find "$release_dir" -type d -exec chmod 0750 {} +
sudo find "$release_dir" -type f -exec chmod 0640 {} +
sudo ln -sfn "$release_dir" "$web_root/current.new"
sudo mv -Tf "$web_root/current.new" "$web_root/current"
rm -f "$web_archive"

test -s "$web_root/current/index.html"

curl --fail --silent --show-error --retry 12 --retry-all-errors --retry-delay 5 \
  --resolve vms.nimfi.dev:443:127.0.0.1 https://vms.nimfi.dev/ >/dev/null

echo "Deployed $commit_sha to https://vms.nimfi.dev"
