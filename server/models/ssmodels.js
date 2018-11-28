/*
**  ssmodels.js - models for SnapperStore
*/

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

// create model classes
// should we force mediatype...?
const mediaSchema = new Schema({
  id: String,

  originalname: String,
  fileName: String,
  size: Number,
  path: String,
  dayDir: String,

  mimeType: String,

  tags: [{
    type: String
  }],

  timeSaved: { type: Date, default: Date.now }
})


// create model classes
const MediaProject = mongoose.model('MediaProject', mediaSchema);
module.exports = {
  mediaSchema,
  MediaProject
};
