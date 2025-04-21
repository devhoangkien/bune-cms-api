#!/bin/bash

set -e

pushd "libs/casl-authorization/"
bun i
bun run build
bun link
popd
pushd "libs/common/"
bun i
bun run build
bun link
popd
