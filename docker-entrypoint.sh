#!/bin/sh
echo "Running prisma migrations..."
node /app/node_modules/prisma/build/index.js migrate deploy --schema=/app/prisma/schema.prisma
echo "Starting server..."
exec "$@"