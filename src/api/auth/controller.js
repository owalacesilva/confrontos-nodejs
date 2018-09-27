import { sign } from '../../services/jwt'
import { success } from '../../services/response/'
import { User } from '../user'

export const login = ({ bodymen: { body }, user }, res, next) => 
  User.findOneAndUpdate({ _id: user._id }, {
    $addToSet: { registration_ids: { $each: body.registration_ids } }
  }, { new: true }).then((updatedUser) => {
    return sign(updatedUser.id)
      .then((token) => ({ token, user: updatedUser.view(true) }))
      .then(success(res, 201))
      .catch(next)
  }).catch(next)
  
