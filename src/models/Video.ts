import { Schema, model } from 'mongoose'

// TODO: videoId should have an index. I guess??
// TODO: The example had an extra interface. Not sure if this is OK.
// TODO: Make sure the _id is not present in results (from API videoInfo)
// TODO: Improve this schema.
// TODO: One way to do it would be to unnest everything and just leave the VideoBasicInfo
//       as the entire document. That means I'd have to copy everything from the VideoBasicInfo
//       (all fields) and turn that into the schema. Perhaps it'd be better to use this model
//       instead of the VideoBasicInfo interface in the Youtube scraping module. Then I just
//       create the instance and execute .save on it instead of the "await upsertBasicInfo(id, videoInfo)"
//       which is kind of awkward because it should be necessary to have a function/service for that.
//       Using Mongoose should be more than enough.
//
//       ^ This refactor is important. Pay attention to it!!!
const videoSchema: Schema = new Schema({
  videoId: { type: String, required: true },
  metadata: { type: Object, required: true }
}, { versionKey: false })

export const VideoModel = model('Video', videoSchema)
