FROM node:9.1.0-alpine

RUN apk update \
  && apk upgrade \
  && apk add pdftk

RUN npm install pm2 -g

ENV NODE_ENV production
ENV PORT 3000

WORKDIR /usr/src/app

COPY package.json .

RUN npm install && mv node_modules ../

COPY . .

EXPOSE 3000

CMD pm2-docker index.js