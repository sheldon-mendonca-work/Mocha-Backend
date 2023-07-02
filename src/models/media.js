import mongoose from "mongoose";
const Schema = mongoose.Schema;

const MediaSchema = new Schema({
  _id: {
    type: String
  },
  type: {
    type: String,
    enum: ['image', 'video', 'gif']
  },
  name: {
    type: String,
    required: true
  },
  public_id: {
    type: String
  },
  signature: {
    type: String
  },
  source: {
    type: String
  },

})

const Media = mongoose.model('Media', MediaSchema);

export default Media;