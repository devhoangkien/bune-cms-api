{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  # Environment name (optional)
  name = "dev-environment";

  # Which nixpkgs channel to use
  channel = "stable-23.11"; # or "unstable"

  # Specify the packages you need in your development environment
  buildInputs = [
    pkgs.nodejs_20
    pkgs.docker
    pkgs.firebase-tools
    pkgs.redis
    pkgs.postgresql
  ];

  # Set environment variables
  shellHook = ''
    export SOME_ENV_VAR="hello"
    export NODE_ENV="development"
    export DATABASE_URL="postgres://bune-cms:bune-cms@localhost:5432/user-svc"
    export REDIS_URL="redis://localhost:6379" # Redis connection string
    export PUBSUB_EMULATOR_HOST="localhost:8085" # Pub/Sub Emulator
  '';
}