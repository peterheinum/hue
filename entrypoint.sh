#!/bin/sh

echo $INTERNALIPADDRESS
export INTERNALIPADDRESS

envsubst '${INTERNALIPADDRESS}' < /config.template > /etc/nginx/conf.d/default.conf

exec "$@"

cat /etc/nginx/conf.d/default.conf

nginx -g 'daemon off;'
