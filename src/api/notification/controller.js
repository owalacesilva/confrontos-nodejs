import { success, notFound } from '../../services/response/'
import { Notification } from '.'

export const index = ({ querymen: { query, select, cursor } }, res, next) =>
  Notification.count(query)
    .then(count => Notification.find(query, select, cursor)
      .then((notifications) => ({
        count,
        rows: notifications.map((notification) => notification.view())
      }))
    )
    .then(success(res))
    .catch(next)

export const show = ({ params }, res, next) =>
  Notification.findById(params.id)
    .then(notFound(res))
    .then((notification) => notification ? notification.view() : null)
    .then(success(res))
    .catch(next)
