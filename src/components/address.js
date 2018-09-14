import { Schema } from 'mongoose'

/* based off Google */
const AddressSchema = new Schema({
  type: {
    type: String,
    enum: ['work', 'home']
  },
  formatted_address: String,
  street_number: String,
  route: String,
  sublocality: String,    /* "bairro", in Portuguese */
  city: String,
  state: String,
  country: String,
  postal_code: String,
  additional_info: String,
  geocode: {
    lat: Number,
    lng: Number
  }
})

AddressSchema.methods = {
  isEqual (address) {
    const curr = this

    if (curr.route && address.route && curr.route.trim().toUpperCase() !== address.route.trim().toUpperCase()) {
      return false
    }

    if (curr.street_number && !address.street_number) {
      return false
    }

    if (!curr.street_number && address.street_number) {
      return false
    }

    if (curr.street_number && address.street_number && curr.street_number.trim().toUpperCase() !== address.street_number.trim().toUpperCase()) {
      return false
    }

    if (curr.additional_info && !address.additional_info) {
      return false
    }

    if (!curr.additional_info && address.additional_info) {
      return false
    }

    if (curr.additional_info && address.additional_info && curr.additional_info.trim().toUpperCase() !== address.additional_info.trim().toUpperCase()) {
      return false
    }

    return true
  },

  isEqualAndAddsDetails (address) {
    const curr = this

    if (curr.route && address.route && curr.route.trim().toUpperCase() !== address.route.trim().toUpperCase()) {
      return false
    }

    if (curr.street_number && !address.street_number) {
      return false
    }

    if (curr.street_number && address.street_number && curr.street_number.trim().toUpperCase() !== address.street_number.trim().toUpperCase()) {
      return false
    }

    if (curr.additional_info && !address.additional_info) {
      return false
    }

    if (curr.additional_info && address.additional_info && curr.additional_info.trim().toUpperCase().length > address.additional_info.trim().toUpperCase()) {
      return false
    }

    return true
  }
}

export default AddressSchema
