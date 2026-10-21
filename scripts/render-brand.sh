#!/usr/bin/env bash
# assets/brand/mark.svg 하나에서 앱 아이콘·스플래시·파비콘 PNG 를 모두 다시 만든다.
# 필요: Google Chrome(SVG 렌더), ImageMagick(magick). 사용: ./scripts/render-brand.sh
set -euo pipefail
cd "$(dirname "$0")/.."

BG='#111111'
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# 1024 투명 바탕의 흰 마크
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
  --default-background-color=00000000 --window-size=1024,1024 \
  --screenshot="$TMP/mark.png" "file://$PWD/assets/brand/mark.svg" >/dev/null 2>&1
MARK="$TMP/mark.png"
OUT=assets/images

# 캔버스 크기 $1 에 마크를 $2 배율로 가운데 놓는다. 나머지 인자는 magick 후처리.
place() {
  local size=$1 scale=$2; shift 2
  local px; px=$(awk "BEGIN{printf \"%d\", 1024*$scale*$size/1024}")
  magick -size "${size}x${size}" xc:none \( "$MARK" -resize "${px}x${px}" \) -gravity center -composite "$@"
}

# iOS/기본 아이콘: 알파 없는 꽉 찬 사각형(모서리는 OS 가 깎는다)
place 1024 0.82 -background "$BG" -flatten -alpha off "PNG24:$OUT/icon.png"
# Android 적응형: 전경은 안전 영역(지름 66%) 안에, 배경은 단색
place 512 0.44 "PNG32:$OUT/android-icon-foreground.png"
magick -size 512x512 "xc:$BG" "PNG24:$OUT/android-icon-background.png"
place 432 0.44 -channel RGB -evaluate set 100% +channel "PNG32:$OUT/android-icon-monochrome.png"
# 스플래시: 여백 없이 잘라낸 마크
magick "$MARK" -trim +repage -resize 400x400 "PNG32:$OUT/splash-icon.png"
# 웹 파비콘
place 1024 0.82 -background "$BG" -flatten -resize 48x48 "PNG24:$OUT/favicon.png"
# iOS Icon Composer 레이어
cp assets/brand/mark.svg assets/expo.icon/Assets/mark.svg

echo "brand assets rendered"
