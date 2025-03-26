#!/bin/bash
touch .env
bun run build-dev
rm ~/Downloads/fakefiller.zip
cd dist/
zip -r ~/Downloads/fakefiller.zip ./*
cd ../
