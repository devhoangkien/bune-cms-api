#!/bin/bash

cd api-gateway && bun run lint && cd -
cd microservices/user-service && bun run lint && cd -