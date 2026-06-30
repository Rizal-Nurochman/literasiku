# Build Stage 1
FROM node:22-slim AS build
WORKDIR /app

RUN corepack enable

# Copy package.json and yarn.lock (and .npmrc if you have one)
COPY package.json yarn.lock .npmrc ./

# Install dependencies
RUN yarn install

# Copy the entire project
COPY . ./

# Build the project
RUN yarn build

# Build Stage 2
FROM node:22-slim
WORKDIR /app

# Only `.output` folder is needed from the build stage
COPY --from=build /app/.output/ ./

# Change the port and host
ENV PORT=80
ENV HOST=0.0.0.0

EXPOSE 80

CMD ["node", "/app/server/index.mjs"]