FROM node:20-bookworm AS base

# 1. Install dependencies only when needed
FROM base AS builder

# Install dependencies
RUN apt update && apt install -y \
      gcc-11 g++-11 cpp-11 jq xsel \
      ca-certificates \
      curl \
      wget \
      jq \
      tar \
      openmpi-bin \
      libopenmpi-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY . ./

RUN make install-and-build

# # 2. Rebuild the source code only when needed
FROM base AS runner

# Install dependencies
RUN apt update && apt install -y \
      gcc-11 g++-11 cpp-11 jq xsel \
      ca-certificates \
      curl \
      wget \
      jq \
      tar \
      openmpi-bin \
      libopenmpi-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the package.json and yarn.lock of root yarn space to leverage Docker cache
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules/
COPY --from=builder /app/yarn.lock ./yarn.lock

# Copy the package.json, yarn.lock, and build output of server yarn space to leverage Docker cache
COPY --from=builder /app/core ./core/
COPY --from=builder /app/server ./server/
RUN cd core && yarn install && yarn run build

# Copy pre-install dependencies
COPY --from=builder /app/pre-install ./pre-install/

# Copy the package.json, yarn.lock, and output of web yarn space to leverage Docker cache
COPY --from=builder /app/joi ./joi/
COPY --from=builder /app/web ./web/

RUN yarn workspace @janhq/joi install && yarn workspace @janhq/joi build
RUN yarn workspace @janhq/web install

RUN npm install -g serve@latest

EXPOSE 1337 3000 3928

ENV JAN_API_HOST 0.0.0.0
ENV JAN_API_PORT 1337

ENV API_BASE_URL http://localhost:1337

CMD ["sh", "-c", "export NODE_ENV=production && yarn workspace @janhq/web build && cd web && npx serve out & cd server && node build/main.js"]

# docker build -t jan .
# docker run -p 1337:1337 -p 3000:3000 -p 3928:3928 jan