import mongoose, { Schema } from 'mongoose'

const ActivitySchema = new Schema({
  user: {
    type: Schema.ObjectId,
    required: [true, 'User is required'],
    ref: 'User'
  },
  status: {
    type: String
  },
  text: {
    type: String,
    default: null
  },
  likes: {
    type: Number,
    default: 0
  },
  author: {
    type: Schema.ObjectId,
    required: [true, 'Author is required'],
    ref: 'User'
  },
  entities: {
    type: [String],
    default: []
  }
}, {
  timestamps: {
    created_at: 'created_at',
    updated_at: 'updated_at'
  },
  toJSON: {
    virtuals: true,
    transform: (obj, ret) => { delete ret._id }
  }
})

ActivitySchema.methods = {
  view (full) {
    const view = {
      // simple view
      id: this.id,
      user: this.user,
      author: this.author,
      status: this.status,
      text: this.text,
      likes: this.likes,
      entities: this.entities,
      created_at: this.created_at,
      updated_at: this.updated_at
    }

    return full ? {
      ...view
      // add properties for a full view
    } : view
  }
}

const model = mongoose.model('Activity', ActivitySchema)

export const schema = model.schema
export default model
