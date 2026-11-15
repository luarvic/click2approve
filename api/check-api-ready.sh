#!/bin/bash
# The API listens only after its database initialization has completed.
set -euo pipefail

exec 3<>/dev/tcp/127.0.0.1/5555
printf 'GET /api/v1/products/info HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n\r\n' >&3
IFS= read -r status <&3
[[ "$status" == *" 200 "* ]]
