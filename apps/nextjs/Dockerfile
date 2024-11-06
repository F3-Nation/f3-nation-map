FROM --platform=linux/amd64 node:20-alpine AS builder
RUN apk add --no-cache libc6-compat openssl && apk update
WORKDIR /app
RUN yarn global add turbo@^1.12.3
COPY . . 
RUN turbo prune --scope=@f3/nextjs --docker

FROM --platform=linux/amd64 node:20-alpine AS installer
RUN apk add --no-cache libc6-compat openssl && apk update
WORKDIR /app

ENV NODE_ENV production
ENV CI         true
ENV SKIP_ENV_VALIDATION true

RUN yarn global add turbo@^1.12.3

COPY .gitignore .gitignore 
COPY --from=builder /app/tooling/typescript/base.json ./tsconfig.json
COPY --from=builder /app/out/json .
COPY --from=builder /app/out/pnpm-lock.yaml\* ./

RUN npm install -g pnpm@8.15.1 && pnpm fetch --prod && pnpm install -r --offline --prod

COPY --from=builder /app/out/full .

RUN wget -q -t3 'https://packages.doppler.com/public/cli/rsa.8004D9FF50437357.key' -O /etc/apk/keys/cli@doppler-8004D9FF50437357.rsa.pub && \
    echo 'https://packages.doppler.com/public/cli/alpine/any-version/main' | tee -a /etc/apk/repositories && \
    apk add doppler

ARG DOPPLER_TOKEN

RUN doppler setup -p f3-2 -c prd
RUN doppler secrets download --no-file --format env > /app/apps/nextjs/.env
RUN doppler run -- sh -c "pnpm turbo build --filter=nextjs && pnpm -F db migrate"

FROM --platform=linux/amd64 node:20-alpine AS runner
RUN apk add --no-cache libc6-compat openssl && apk update
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs
EXPOSE 3000
ENV PORT 3000

ENV NODE_ENV production

COPY --from=installer /app/apps/nextjs/next.config.js ./
COPY --from=installer /app/apps/nextjs/package.json ./

COPY --from=installer --chown=nextjs:nodejs /app/apps/nextjs/.env ./apps/nextjs/.env
COPY --from=installer --chown=nextjs:nodejs /app/apps/nextjs/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/nextjs/.next/static ./apps/nextjs/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/nextjs/public ./apps/nextjs/public

CMD node apps/nextjs/server.js
