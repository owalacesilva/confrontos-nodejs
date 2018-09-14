import { success, notFound } from '../../services/response/'
import { Message } from '.'

export const create = ({ bodymen: { body } }, res, next) =>
  Message.create(body)
    .then((message) => message.view(true))
    .then(success(res, 201))
    .catch(next)

export const index = ({ querymen: { query, select, cursor } }, res, next) =>
  Message.count(query)
    .then(count => Message.find(query, select, cursor)
      .then((messages) => ({
        count,
        rows: messages.map((message) => message.view())
      }))
    )
    .then(success(res))
    .catch(next)

export const show = ({ params }, res, next) =>
  Message.findById(params.id)
    .then(notFound(res))
    .then((message) => message ? message.view() : null)
    .then(success(res))
    .catch(next)
