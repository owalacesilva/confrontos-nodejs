import FCM from 'fcm-push'
import mongoose, { Schema } from 'mongoose'
import moment from 'moment'
import { fcmApiKey, env } from './../../config'

const NotificationSchema = new Schema({
  recipient: {
    type: Schema.ObjectId,
    required: [true, 'Recipient is required'],
    ref: 'User'
  },
  type: {
    type: String,
    enum: ['informational', 'actionable'],
    required: true, 
    default: 'informational'
  },
  information: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    required: true, 
    default: false
  },
  anchor: {
    type: String,
    enum: ['Invitation', 'Match', 'RatingOpponent', 'Chats'],
    required: true
  },
  payload: Schema.Types.Mixed,
  push_sent: {
    type: Boolean,
    default: false
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

NotificationSchema.methods = {
  view (full) {
    const view = {
      // simple view
      id: this.id,
      recipient: this.recipient,
      information: this.information,
      read: this.read,
      anchor: this.anchor,
      payload: this.payload,
      push_sent: this.push_sent,
      created_at: this.created_at,
      updated_at: this.updated_at
    }

    return full ? {
      ...view
      // add properties for a full view
    } : view
  }
}

NotificationSchema.statics = {  
  async notify (action, docOrigin, params) {
    let newDoc, notification, information, regIds = [];
    if (action === 'invitation_created') {
      information = `<div><b>${docOrigin.user.display_name}</b> convidou você para uma partida contra sua equipe <b>${docOrigin.guest_team.display_name}</b></div>`;
      regIds = docOrigin.guest_user.registration_ids
      newDoc = {
        recipient: params.recipient,
        anchor: 'Invitation',
        information, 
        payload: {
          invitation_id: params.invitation_id
        }
      }
      notification = {
        title: "Convite para um amistoso", 
        subtitle: "Convite recebido...", 
        body: "Você recebeu um convite para um amistoso",
        click_action: null
      }
    } else if (action === 'invitation_status_changed') {
      newDoc = { recipient: params.recipient, anchor: 'Match' }
      if (params.status === 'accepted') {
        information = `<div><b>${docOrigin.guest_team.display_name}</b> aceitou seu desafio para a partida de <b>${moment(docOrigin.date).format("DD/MM")}</b></div>`
        regIds = docOrigin.user.registration_ids
        notification = {
          title: "Seu convite foi aceito", 
          subtitle: "Convite aceito...", 
          body: "Você recebeu a confirmação do convite enviado",
          click_action: null
        }
        newDoc = { ...newDoc, information,  payload: { match_id: params.match_id } }
      } else if (params.status === 'refused') {
        information = `<div><b>${docOrigin.guest_team.display_name}</b> recusou seu desafio para a partida de <b>${moment(docOrigin.date).format("DD/MM")}</b></div>`
        regIds = docOrigin.user.registration_ids
        notification = {
          title: "Seu convite foi recusado", 
          subtitle: "Convite recusado...", 
          body: "Você recebeu a recusa do convite enviado",
          click_action: null
        }
        newDoc = { ...newDoc, information, payload: { invitation_id: params.invitation_id } }
      }
    } else if (action === 'match_status_changed') {
      information = `<div>Sua proxima partida começou</div>`;
      newDoc = {
        recipient: params.recipient,
        anchor: 'Match',
        information, 
        payload: {
          match_id: params.match_id
        }
      }
      notification = {
        title: "Sua proxima partida começou", 
        subtitle: "Partida em andamento...", 
        body: "Sua proxima partida começou",
        click_action: null
      }
    } else if (action === 'close_match') {
      information = `<div>Partida encerrada</div>`;
      newDoc = {
        recipient: params.recipient,
        anchor: 'Match',
        information, 
        payload: {
          match_id: params.match_id
        }
      }
      notification = {
        title: "Partida encerrada", 
        subtitle: "Partida finalizada...", 
        body: "Partida encerrada",
        click_action: null
      }
    }
    
    const notif = await model.create({ ...newDoc })
    const message = {
      priority: 'high', 
      collapse_key: 'com.confrontos', 
      dry_run: env === 'test' ? true: false, // debug
      // to: 'dXQmCN_3iJ8:APA91bG0HZe4nacygq1l0hLhdLnQVVrKf0CkS3nV1KG8GGVdAJxcAd7rsxCgEte755sECLa2QT5TRrvAZRwlzCJzueoYVcJKL5Xt2JPgGeyESNtgxxXpDOeJOmL1afHtSEFqcn_iyIVz', 
      registration_ids: regIds, 
      data: { 
        notification_id: notif._id || notif.id, 
        action: notif.type 
      }, 
      notification: notification
    }
  
    const fcm = new FCM(fcmApiKey)
    fcm.send(message, (err, response) => {
      if (env === 'test') {
        console.log('Notification:', response, information)
      }
      if(!err && response.success > 0) {
        notif.push_sent = true
        notif.save()
      }
    })

    return notif
  }
}

const model = mongoose.model('Notification', NotificationSchema)

export const schema = model.schema
export default model
