#!/bin/bash

set -e

# Build and link for "libs/casl-authorization/"
(cd "libs/casl-authorization/" && bun i && bun run build && bun link)

# Build and link for "libs/common/"
(cd "libs/common/" && bun i && bun run build && bun link)