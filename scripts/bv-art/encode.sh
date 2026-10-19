#!/bin/sh
# TASK-276: encodes the Higgsfield masters (generated on the page colour) into feathered WebP.  sh scripts/bv-art/encode.sh <masters-dir>
set -e
M="$1"; PY="${PY:-python3}"; O=public/media/case-studies/bhakti-vilas/art; mkdir -p $O
F=scripts/bv-art/flatten.py
L='#f7f1e7'; D='#0b1530'
"$PY" $F "$M/hero-light.png" $O/hero-light.webp $L 1700 - 0.05
"$PY" $F "$M/hero-dark.png" $O/hero-dark.webp $D 1700 - 0.05
"$PY" $F "$M/foot-light.png" $O/footer-light.webp $L 2400 - 0.04
"$PY" $F "$M/foot-dark.png" $O/footer-dark.webp $D 2400 - 0.04
i=0
for n in diya circle rhythm progress; do
  case $i in 0) c=0.004,0.004,0.496,0.496;; 1) c=0.504,0.004,0.996,0.496;; 2) c=0.004,0.504,0.496,0.996;; 3) c=0.504,0.504,0.996,0.996;; esac
  "$PY" $F "$M/obj-light.png" $O/obj-$n-light.webp $L 480 $c 0.14
  "$PY" $F "$M/obj-dark.png" $O/obj-$n-dark.webp $D 480 $c 0.14
  i=$((i+1))
done
