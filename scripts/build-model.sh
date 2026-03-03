#!/bin/sh

set -e

npm i
npm run build-wally
rm -rf out/**/*.d.ts
rm -rf out/**/*.spec.lua
rojo build -o action-context.rbxm default.project.json