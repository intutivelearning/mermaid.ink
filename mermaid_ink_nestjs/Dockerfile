FROM node:23.11.0-alpine3.21
LABEL maintainer="Your Name <your@email.com>"

# Install system dependencies (if needed for rendering, e.g. fonts)
USER root
RUN apk add --no-cache \
    font-noto \
    font-noto-cjk \
    font-noto-emoji \
    fontconfig

# Install Chromium for Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Set environment variable for Puppeteer to use the installed Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Create app directory and set permissions
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup \
    && chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Set up global pnpm for the user
ENV NPM_CONFIG_PREFIX=/home/appuser/.npm-global
ENV PATH=$PATH:/home/appuser/.npm-global/bin
RUN mkdir -p /home/appuser/.npm-global/bin
RUN corepack enable --install-directory /home/appuser/.npm-global/bin

# Copy package files and prefetch dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm fetch --prod

# Copy the rest of the application
COPY . ./

# Install dependencies offline
RUN pnpm install --offline --prod

# Ensure dist is owned by appuser before build
RUN rm -rf dist && mkdir -p dist && chown -R appuser:appgroup dist

# Build the NestJS app
RUN pnpm run build

EXPOSE 3000
CMD ["pnpm", "start:prod"]
