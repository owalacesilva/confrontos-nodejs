import { User } from './../user'
import { Message } from '.'

let message, user

beforeEach(async () => {
  user = await User.create({ 
    display_name: 'aaa', 
    gender: 'male', 
    email: 'a@a.com', 
    password: '123456' 
  })
  message = await Message.create({ 
    sender: user.id, 
    receiver: user.id, 
    author: user.id, 
    message: {
      text: "Hello world"
    }
  })
  message.setNext('chat_id', (err, doc) => {
    if(err) console.log('Cannot increment the chat id', err)
  })
})

describe('view', () => {
  it('returns full view', () => {
    const view = message.view()
    expect(typeof view).toBe('object')
    expect(view.id).toBe(message.id)
    expect(view.chat_id).toBeTruthy()
    expect(view.chat_id).toBe(message.chat_id)
    expect(view.created_at).toBeTruthy()
    expect(view.updated_at).toBeTruthy()
  })
})
