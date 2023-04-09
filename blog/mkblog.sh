#!/usr/bin/env -S bash --norc

PAGE_TITLE=$1
BLOG_TITLE=$2

if ! [[ -n $PAGE_TITLE ]] || ! [[ -n $BLOG_TITLE ]]; then
    echo "Usage: $0 PAGE_TITLE BLOG_TITLE"
else
    DATE="$(date +'%d %B %Y')"
    echo "[heading]
PAGE_TITLE = \"$PAGE_TITLE\"
BLOG_TITLE = \"$BLOG_TITLE\"
DATE = \"$DATE\"" > "./content/$PAGE_TITLE.toml"
    touch "./content/$PAGE_TITLE.html"
fi