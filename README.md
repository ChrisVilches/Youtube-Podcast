# Youtube Podcast

System for scraping Youtube videos and converting them into podcasts (or music files).

Transcription, frontend and content summarization features coming soon.

## Run

Installation:

```sh
nvm use
npm install
```

Configure the `.env` file.

Make sure `ffmpeg` is installed.

```sh
ffmpeg -version
ffmpeg version 4.4.2-0ubuntu0.22.04.1 Copyright (c) 2000-2021 the FFmpeg developers
```

API:

```sh
npm run dev:api
```

Worker:

```sh
npm run dev:worker
```

## Tools Used

* TypeScript
* Node.js + Express
* MongoDB
* Redis
* MinIO
* Jest
* ffmpeg
* Other libraries (Bull, Youtube.js, RxJS, Mongoose, Typegoose, etc)

## Limitations

* Videos may be unavailable for download depending on the server location (region).
* Cached data (such as transcriptions, video metadata, etc) may never be re-fetched (e.g. doesn't re-fetch even if new transcriptions are added to the video).
