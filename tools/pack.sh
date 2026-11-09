#!/bin/sh
# Builds dist/rewind-for-x-<version>.zip for unpacked installation or the
# Chrome Web Store, including installation instructions and the license.
set -eu
cd "$(dirname "$0")/.."
version=$(sed -n 's/.*"version": *"\([^"]*\)".*/\1/p' manifest.json)
out="dist/rewind-for-x-$version.zip"
mkdir -p dist
rm -f "$out"
zip -qrX "$out" manifest.json background.js content.js _locales icons INSTALL.md LICENSE -x '*.DS_Store'
unzip -l "$out"
