FROM node:20-alpine3.16 AS base

WORKDIR /usr/app

RUN apk --no-cache --virtual build-dependencies add python3 make g++

COPY package*.json ./
RUN npm install

FROM base AS worker
RUN apk add  --no-cache ffmpeg
