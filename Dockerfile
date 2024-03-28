FROM node:19-alpine3.16

WORKDIR /app

# RUN apk add --no-cache libc6-compat
# RUN apk add --no-cache openssl1.1-compat-dev

COPY package.json yarn.lock ./

RUN yarn

COPY . .

CMD ["yarn", "start:dev"]