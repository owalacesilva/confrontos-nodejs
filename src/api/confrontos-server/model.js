import mongoose, { Schema } from 'mongoose'

const confrontosServerSchema = new Schema({}, { timestamps: true })

confrontosServerSchema.methods = {
  view (full) {
    const view = {
      // simple view
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }

    return full ? {
      ...view
      // add properties for a full view
    } : view
  }
}

const model = mongoose.model('ConfrontosServer', confrontosServerSchema)

export const schema = model.schema
export default model
