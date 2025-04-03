
cd api-gateway && bun run build && cd -
cd microservices/user-service && bun run build && cd -
docker-compose build --no-cache