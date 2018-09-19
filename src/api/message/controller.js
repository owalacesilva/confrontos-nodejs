import { success, notFound } from '../../services/response/'
import { Message } from '.'

export const create = ({ bodymen: { body: { chat_id, text } }, user }, res, next) =>
  Message.findOne({ chat_id }, null, { sort: { created_at: -1 } })
    .then(notFound(res))
    .then((message) => {
      if (!message) next()
      let receiver;
      if (user.id === message.sender.toString()) {
        receiver = message.receiver.toString()
      } else {
        receiver = message.sender.toString()
      }
      return receiver 
    })
    .then((receiver) => Message.create({ 
        chat_id, 
        sender: user._id, 
        receiver, 
        author: user._id, 
        message: { text } 
      })
      .then((message) => message.view(true))
      .then(success(res, 201))
      .catch(next)
    )
    .catch(next)

export const index = ({ querymen: { query, select, cursor } }, res, next) =>
  Message.count(query)
    .then(count => Message.find(query, select, cursor)
      .populate([{ 
        path: 'sender', 
        select: 'display_name'
      }, { 
        path: 'receiver', 
        select: 'display_name'
      }, { 
        path: 'author', 
        select: 'display_name'
      }])
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
