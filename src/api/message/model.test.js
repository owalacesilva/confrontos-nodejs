import { User } from './../user'
import { Message } from '.'

let message, user

beforeEach(async () => {
  user = await User.create({ email: 'a@a.com', password: '123456' })
  message = await Message.create({ 
    sender: user.id, 
    receiver: user.id, 
    author: user.id, 
    message: {
      text: "Hello world"
    }
  })
  Message.newChatId(message.id)
})

describe('view', () => {
  it('returns simple view', () => {
    const view = message.view()
    expect(typeof view).toBe('object')
    expect(view.id).toBe(message.id)
    expect(view.created_at).toBeTruthy()
    expect(view.updated_at).toBeTruthy()
  })

  /*it('returns full view', () => {
    const view = message.view(true)
    expect(typeof view).toBe('object')
    expect(view.id).toBe(message.id)
    expect(view.created_at).toBeTruthy()
    expect(view.updated_at).toBeTruthy()
  })*/
})
