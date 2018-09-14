import mongoose, { Schema } from 'mongoose'
import AddressSchema from '../../components/address'

const MatchSchema = new Schema({
  date: {
    type: Date, 
    required: [true, 'Date is required'],
  },
  start_at: {
    type: Date, 
    required: [true, 'Start at is required'],
  },
  sport: {
    type: String,
    required: [true, 'Sport is required'],
    lowercase: true, 
    enum: ['football', 'soccer', 'basketball', 'voleyball', 'futsal']
  },
  address: { 
    type: AddressSchema, 
    required: [true, 'Address is required']
  },
  stats: [{
    "name": String,
    "label": String,
    "home_team_score": Number,
    "visiting_team_score": Number
  }],
  lineups: [{
    home_team:{
      user: {
        type: Schema.ObjectId,
        required: [true, 'Player user is required'],
        ref: 'User'
      },
      position: {
        type: String,
        required: [true, 'Player position is required'],
      }
    },
    visiting_team: {
      user: {
        type: Schema.ObjectId,
        required: [true, 'Player user is required'],
        ref: 'User'
      },
      position: {
        type: String,
        required: [true, 'Player position is required'],
      }
    }
  }],
  home_team: {
    type: Schema.ObjectId,
    required: [true, 'Home Team is required'],
    ref: 'Team'
  },
  visiting_team: {
    type: Schema.ObjectId,
    required: [true, 'Visiting Team is required'],
    ref: 'Team'
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

MatchSchema.methods = {
  view (full) {
    const view = {
      // simple view
      id: this.id,
      date: this.date,
      start_at: this.start_at,
      sport: this.sport,
      address: this.address,
      home_team: this.home_team,
      visiting_team: this.visiting_team,
      stats: this.stats,
      lineups: this.lineups,
      created_at: this.created_at,
      updated_at: this.updated_at
    }

    return full ? {
      ...view
      // add properties for a full view
    } : view
  }
}

const model = mongoose.model('Match', MatchSchema)

export const schema = model.schema
export default model
