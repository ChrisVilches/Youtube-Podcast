FROM node:20-alpine3.16 AS base

WORKDIR /usr/app

RUN apk --no-cache --virtual build-dependencies add python3 make g++

COPY package*.json ./
RUN npm install

FROM base AS worker
RUN apk add  --no-cache ffmpeg

# TODO: Three images are built, even though API and Socket have the same image. (Only worker has different stuff)
# I think this issue is related https://github.com/docker/compose/issues/963
# Expected result should be two images with the same hash with a smaller size than another
# image with different hash (which contains ffmpeg)
