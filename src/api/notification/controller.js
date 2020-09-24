import { success, notFound } from '../../services/response/'
import { Notification } from '.'

export const index = ({ querymen: { query, select, cursor }, user }, res, next) =>
  Notification.count({ ...query, recipient: user._id })
    .then(count => Notification.find({ ...query, recipient: user._id }, select, cursor)
      .populate({
        path: 'recipient',
        select: 'display_name'
      })
      .then((notifications) => ({
        count,
        rows: notifications.map((notification) => notification.view())
      }))
    )
    .then(success(res))
    .catch(next)

export const show = ({ params, user }, res, next) =>
  Notification.findOne({ '_id': params.id, recipient: user._id })
    .then(notFound(res))
    .then((notification) => notification ? notification.view() : null)
    .then(success(res))
    .catch(next)
