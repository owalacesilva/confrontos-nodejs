import mongoose, { Schema } from 'mongoose'

const FeedNewsSchema = new Schema({
  user: {
    type: Schema.ObjectId,
    required: [true, 'User is required'],
    ref: 'User'
  },
  activity: {
    type: Schema.ObjectId,
    required: [true, 'Activity is required'],
    ref: 'Activity'
  },
  relevance: {
    type: Number
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  },
  toJSON: {
    virtuals: true,
    transform: (obj, ret) => { delete ret._id }
  }
})

FeedNewsSchema.methods = {
  view (full) {
    const view = {
      // simple view
      id: this.id,
      user: this.user,
      activity: this.activity,
      relevance: this.relevance,
      created_at: this.created_at,
      updated_at: this.updated_at
    }

    return full ? {
      ...view
      // add properties for a full view
    } : view
  }
}

const model = mongoose.model('FeedNews', FeedNewsSchema)

export const schema = model.schema
export default model
