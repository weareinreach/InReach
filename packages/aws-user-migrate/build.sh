#!/bin/sh

set -eux

rm -fr ./dist

rm bundle.zip || true

# Run ncc bundler
pnpm bundle

# Delete other prisma clients
# find dist/client -type f -not -name '*rhel*' -delete -print

# Prisma expects the client in '.prisma/client/'

# mv dist/client/* dist/

cd dist
zip -r ../bundle.zip *

du -h ../bundle.zip
