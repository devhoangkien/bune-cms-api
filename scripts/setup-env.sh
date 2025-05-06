#!/bin/bash

set -e

# copy env root
(cp example.env .env)

# copy env service
(cd "microservices/user-service/" && cp example.env .env )

# copy env api gateway
(cd "api-gateway/" && cp example.env .env )