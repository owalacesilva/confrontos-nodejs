import slug from 'slug'
import acronym from '@chan4lk/acronym'
import mongoose, { Schema } from 'mongoose'
import MongooseKeywords from 'mongoose-keywords'
import AddressSchema from '../../components/address'

const TeamSchema = new Schema({
  user: {
    type: Schema.ObjectId,
    required: [true, 'User is required'],
    ref: 'User'
  },
  display_name: {
    type: String,
    required: [true, 'Display name is required'],
    trim: true
  },
  slug: {
    type: String, 
    unique: true
  },
  abbr: {
    type: String,
    uppercase: true
  },
  sport: {
    type: String,
    required: [true, 'Sport is required'],
    lowercase: true, 
    enum: ['football', 'soccer', 'basketball', 'voleyball', 'futsal']
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['male', 'female'],
    lowercase: true, 
    default: 'male'
  },
  age_ranger: {
    type: String,
    enum: ['10-20', '20-30']
  },
  phones: [{
    area_code: {
      type: Number
    },
    number: {
      type: Number
    }
  }],
  address: { 
    type: AddressSchema, 
    required: [true, 'Address is required']
  },
  ranking: {
    type: Map,
    of: Number,
    default: {}
  },
  schedule: [{
    weekday: {
      type: Number
    },
    hour: {
      type: String
    }
  }],
  players: [{
    user: {
      type: Schema.ObjectId,
      required: [true, 'Player user is required'],
      ref: 'User'
    },
    position: {
      type: String,
      required: [true, 'Player position is required'],
    }
  }],
  pictures: {
    type: Map,
    of: String
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

TeamSchema.pre('save', function (next) {
  const team = this
  
  team.slug = slug(team.display_name).toLowerCase()
  acronym(team.display_name, (err, resp) => {
    team.abbr = resp
    next()
  })
})

TeamSchema.methods = {
  view (full) {
    const view = {
      // simple view
      id: this.id,
      user: this.user,
      display_name: this.display_name,
      slug: this.slug,
      abbr: this.abbr,
      sport: this.sport,
      gender: this.gender,
      age_ranger: this.age_ranger,
      phones: this.phones,
      address: this.address,
      ranking: this.ranking,
      schedule: this.schedule,
      pictures: this.pictures,
      players: this.players,
      keywords: this.keywords,
      created_at: this.created_at,
      updated_at: this.updated_at
    }

    return full ? {
      ...view
      // add properties for a full view
    } : view
  }
}

TeamSchema.plugin(MongooseKeywords, { paths: [ 'display_name' ] })

const model = mongoose.model('Team', TeamSchema)

export const schema = model.schema
export default model
