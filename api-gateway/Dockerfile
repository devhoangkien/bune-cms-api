# Use Bun as the base image
FROM oven/bun:latest AS build

# Set the working directory
WORKDIR /app

# Copy package files first for better caching
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Build the application
RUN bun run build

# Use a lightweight Bun image for production
FROM oven/bun:latest AS production

WORKDIR /app

# Copy only necessary files from the build stage
COPY --from=build /app /app

# Set environment variables
ARG PORT=3000  # Default port if not provided
ENV PORT=${PORT}

# Expose the application port dynamically
EXPOSE ${PORT}

# Start the NestJS application using Bun
CMD ["bun", "run", "start:prod"]
