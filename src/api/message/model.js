import mongoose, { Schema } from 'mongoose'
import MongooseSequence from 'mongoose-sequence'

const MessageSchema = new Schema({
  chat_id: {
    type: Number
  },
  sender: {
    type: Schema.ObjectId,
    required: [true, 'Sender is required'],
    ref: 'User'
  },
  receiver: {
    type: Schema.ObjectId,
    required: [true, 'Receiver is required'],
    ref: 'User'
  },
  author: {
    type: Schema.ObjectId,
    required: [true, 'Author is required'],
    ref: 'User'
  },
  message: {
    text: {
      type: String,
      required: true
    }
  },
  attatchments: [String],
  sent: {
    type: Boolean,
    default: true
  },
  received: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  },
  toJSON: {
    virtuals: true
    //transform: (obj, ret) => { delete ret._id }
  }
})

MessageSchema.methods = {
  view (full) {
    const view = {
      // simple view
      id: this.id,
      chat_id: this.chat_id,
      sender: this.sender,
      receiver: this.receiver,
      author: this.author,
      message: this.message,
      attatchments: this.attatchments,
      sent: this.sent,
      received: this.received,
      created_at: this.created_at,
      updated_at: this.updated_at
    }

    return full ? {
      ...view
      // add properties for a full view
    } : view
  }
}

MessageSchema.statics.newChatId = function(messageId) {
  this.findById(messageId, function(error, message) {
    message.setNext('chat_id', (err, doc) => {
      if(err) console.log('Cannot increment the chat id', err)
    })
  })
}

const AutoIncrement = MongooseSequence(mongoose)
MessageSchema.plugin(AutoIncrement, {
  inc_field: 'chat_id',
  disable_hooks: true
})

const model = mongoose.model('Message', MessageSchema)

export const schema = model.schema
export default model
