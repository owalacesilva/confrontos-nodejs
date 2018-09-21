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
  guest_user: {
    type: Schema.ObjectId,
    required: [true, 'Guest User is required'],
    ref: 'User'
  },
  team: {
    type: Schema.ObjectId,
    required: [true, 'Team is required'],
    ref: 'Team'
  },
  host_team: {
    type: Schema.ObjectId,
    required: [true, 'Host Team is required'],
    ref: 'Team'
  },
  visiting_team: {
    type: Schema.ObjectId,
    required: [true, 'Visiting Team is required'],
    ref: 'Team'
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
      populate({ path: 'user', select: 'display_name picture registration_ids' })
      .populate({ path: 'guest_user', select: 'display_name picture registration_ids' })
      .populate({ path: 'team', select: 'display_name pictures' })
      .populate({ path: 'guest_team', select: 'display_name pictures' })
      .populate({ path: 'host_team', select: 'display_name pictures' })
      .populate({ path: 'visiting_team', select: 'display_name pictures' })
      .execPopulate()
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
      populate({ path: 'user', select: 'display_name picture registration_ids' })
      .populate({ path: 'guest_user', select: 'display_name picture registration_ids' })
      .populate({ path: 'team', select: 'display_name pictures' })
      .populate({ path: 'guest_team', select: 'display_name pictures' })
      .populate({ path: 'host_team', select: 'display_name pictures players address sport' })
      .populate({ path: 'visiting_team', select: 'display_name pictures players' })
      .execPopulate()
      .then((invitation) => {
        if (invitation.status === 'accepted') {
          const { host_team, visiting_team } = invitation
          let numPlayers = Math.max(host_team.players.length, visiting_team.players.length), lineups = []
          for (let i = 0; i < numPlayers; i++) {
            lineups.push({
              home_team: invitation.host_team.players[i], 
              visiting_team: invitation.visiting_team.players[i],
            })
          }

          return Match.create({ 
            home_team: invitation.host_team._id, 
            visiting_team: invitation.visiting_team._id, 
            lineups: lineups,
            address: invitation.host_team.address, 
            sport: invitation.host_team.sport, 
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
      host_team: this.host_team,
      visiting_team: this.visiting_team,
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
