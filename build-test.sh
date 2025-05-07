#!/bin/bash
touch .env
bun run build-dev
OUTPUT=`readlink -f ~/Downloads`
./node_modules/.bin/web-ext build --source-dir=./dist --artifacts-dir=$OUTPUT --filename=fakefiller.xpi --overwrite-dest
