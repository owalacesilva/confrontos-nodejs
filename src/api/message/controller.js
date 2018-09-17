import { success, notFound } from '../../services/response/'
import { Message } from '.'

export const create = ({ bodymen: { body: { chat_id, sender, text } } }, res, next) =>
  Message.findOne({ chat_id: chat_id })
    .then((lastMessage) => {
      let receiver;
      if (sender === lastMessage.sender.toString()) {
        receiver = lastMessage.receiver.toString()
      } else {
        receiver = lastMessage.sender.toString()
      }
      return receiver 
    })
    .then((receiver) => Message.create({ chat_id, sender, receiver, author: sender, message: { text } })
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
