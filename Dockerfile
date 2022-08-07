FROM node:16.14.2-alpine AS builder

WORKDIR /usr/src/app

COPY . .
RUN yarn install
RUN yarn db:migrate
RUN yarn build

FROM builder AS runner

COPY --from=builder /usr/src/app/dist .

CMD [ "yarn", "start:prod" ]
