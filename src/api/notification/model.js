import FCM from 'fcm-push'
import mongoose, { Schema } from 'mongoose'
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
    let newDoc, notification, information;
    if (action === 'invitation_created') {
      information = `<div><b>${docOrigin.user.display_name}</b> convidou você para uma partida contra sua equipe <b>${docOrigin.guest_team.display_name}</b></div>`;
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
        sound: "default",
        click_action: null,
        badge: 1, 
        icon: "ic_launcher",
        color: '#fff'
      }
    } else if (action === 'invitation_status_changed') {
      newDoc = { recipient: params.recipient, anchor: 'Match' }
      if (params.status === 'accepted') {
        information = `<div><b>${docOrigin.guest_team.display_name}</b> aceitou seu desafio para a partida de <b>${docOrigin.date}</b></div>`
        notification = {
          title: "Seu convite foi aceito", 
          subtitle: "Convite aceito...", 
          body: "Você recebeu a confirmação do convite enviado",
          sound: "default",
          click_action: null,
          badge: 1, 
          icon: "ic_launcher",
          color: '#fff'
        }
        newDoc = { ...newDoc, information,  payload: { match_id: params.match_id } }
      } else if (params.status === 'refused') {
        information = `<div><b>${docOrigin.guest_team.display_name}</b> recusou seu desafio para a partida de <b>${docOrigin.date}</b></div>`
        notification = {
          title: "Seu convite foi recusado", 
          subtitle: "Convite recusado...", 
          body: "Você recebeu a recusa do convite enviado",
          sound: "default",
          click_action: null,
          badge: 1, 
          icon: "ic_launcher",
          color: '#fff'
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
        sound: "default",
        click_action: null,
        badge: 1, 
        icon: "ic_launcher",
        color: '#fff'
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
        sound: "default",
        click_action: null,
        badge: 1, 
        icon: "ic_launcher",
        color: '#fff'
      }
    }
    
    const notif = await model.create({ ...newDoc })
    const message = {
      priority: 'high', 
      collapse_key: 'com.confrontos', 
      dry_run: env === 'test' ? true: false, // debug
      // to: 'dXQmCN_3iJ8:APA91bG0HZe4nacygq1l0hLhdLnQVVrKf0CkS3nV1KG8GGVdAJxcAd7rsxCgEte755sECLa2QT5TRrvAZRwlzCJzueoYVcJKL5Xt2JPgGeyESNtgxxXpDOeJOmL1afHtSEFqcn_iyIVz', 
      registration_ids: [
        'dXQmCN_3iJ8:APA91bG0HZe4nacygq1l0hLhdLnQVVrKf0CkS3nV1KG8GGVdAJxcAd7rsxCgEte755sECLa2QT5TRrvAZRwlzCJzueoYVcJKL5Xt2JPgGeyESNtgxxXpDOeJOmL1afHtSEFqcn_iyIVz', 
        'ffGTv0at9pk:APA91bESH7ohFG0gpYcdKl02AGzfGThQfnZMoiX32_O6Fg94VTEM9UBq0YLsu-B44CnkavCvHIpC4ShyB97xxVaJlj14RWwFiMknACFrpP0zy-qzId3vARuu7jQypnVDC1vsrftT6Y3f', 
        'eZq5RrKTCCY:APA91bHLBvMIu77IsCmNWYcgF3T9zUAKcHvAradsHB1VTlTyNWpCb8iS8h6mORz-7EIRz97z3Uli1x5WUuK9AQSOAisX4U5SPcPeaeL9jHu2Yy95luLVANRIvzXamtj9UrReSamrCrFe'
      ], 
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
