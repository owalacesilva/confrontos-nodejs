import mongoose, { Schema } from 'mongoose'
import { Notification } from './../notification'
import { Match } from './../match'
import { Message } from './../message'

const InvitationSchema = new Schema({
  user: {
    type: Schema.ObjectId,
    required: [true, 'User is required'],
    ref: 'User'
  },
  team: {
    type: Schema.ObjectId,
    required: [true, 'Team is required'],
    ref: 'Team'
  },
  guest_user: {
    type: Schema.ObjectId,
    required: [true, 'Guest User is required'],
    ref: 'User'
  },
  guest_team: {
    type: Schema.ObjectId,
    required: [true, 'Guest Team is required'],
    ref: 'Team'
  },
  match: {
    type: Schema.ObjectId,
    required: false,
    ref: 'Match'
  },
  status: {
    type: String, 
    enum: ['pending', 'accepted', 'refused'], 
    required: [true, 'Status is required'],
    default: 'pending'
  },
  date: {
    type: Date, 
    required: [true, 'Date is required'],
  },
  start_at: {
    type: Date, 
    required: [true, 'Start at is required'],
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

InvitationSchema.pre('save', function(next) {
  this.wasNew = this.isNew
  next()
})

InvitationSchema.post('save', function (doc, next) {
  if (this.wasNew) {
    doc.
      populate({ path: 'user', select: 'display_name' })
      .populate({ path: 'guest_user', select: 'display_name' })
      .populate({ path: 'team', select: 'display_name' })
      .populate({ path: 'guest_team', select: 'display_name' })
      .execPopulate()
      .then((invitation) => {
        return Message.create({
          sender: invitation.user._id,
          receiver: invitation.guest_user._id,
          author: invitation.user._id,
          message: { text: "Boa noite" },
        })
        .then((message) => {
          message.setNext('chat_id', (err, doc) => {
            if(err) console.log('Cannot increment the chat id', err)
          })
          return invitation
        })
        .catch(next)
      })
      .then((invitation) => {
        Notification.notify('invitation_created', invitation, { 
          invitation_id: invitation._id, 
          recipient: invitation.guest_user._id 
        })
        
        next()
      })
  }
  next()
})

InvitationSchema.post('save', function (doc, next) {
  if (!this.wasNew && doc.status != 'pending') {
    doc.
       populate({ path: 'user', select: 'display_name' })
      .populate({ path: 'guest_user', select: 'display_name' })
      .populate({ path: 'team', select: 'display_name address sport' })
      .populate({ path: 'guest_team', select: 'display_name' })
      .execPopulate()
      .then((invitation) => {
        if (invitation.status === 'accepted') {
          return Match.create({ 
            home_team: invitation.team._id, 
            visiting_team: invitation.guest_team._id, 
            address: invitation.team.address, 
            sport: invitation.team.sport, 
            date: invitation.date, 
            start_at: invitation.start_at 
          }).then(async (match) => {
            invitation.match = match._id || match.id
            // await invitation.save()
            return invitation
          })
        } else {
          return invitation  
        }
      })
      .then((invitation) => {
        Notification.notify('invitation_status_changed', invitation, { 
          invitation_id: invitation._id, 
          match_id: invitation.match ? invitation.match : null, 
          recipient: invitation.user._id, 
          status: invitation.status 
        })
        next()
      })
  }
  next()
})

InvitationSchema.methods = {
  view (full) {
    const view = {
      // simple view
      id: this.id,
      user: this.user,
      guest_user: this.guest_user,
      team: this.team,
      guest_team: this.guest_team,
      match: this.match,
      date: this.date,
      status: this.status,
      start_at: this.start_at,
      created_at: this.created_at,
      updated_at: this.updated_at
    }

    return full ? {
      ...view
      // add properties for a full view
    } : view
  }
}

const model = mongoose.model('Invitation', InvitationSchema)

export const schema = model.schema
export default model
