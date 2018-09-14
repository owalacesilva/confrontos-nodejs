import crypto from 'crypto'
import { User } from '.'

let user

beforeEach(async () => {
  user = await User.create({ 
    display_name: 'user', 
    email: 'a@a.com', 
    password: '123456' 
  })
})

describe('set email', () => {
  it('sets display_name automatically', () => {
    user.display_name = ''
    user.email = 'test@example.com'
    expect(user.display_name).toBe('test')
  })

  it('sets picture automatically', () => {
    const hash = crypto.createHash('md5').update(user.email).digest('hex')
    expect(user.picture).toBe(`https://gravatar.com/avatar/${hash}?d=identicon`)
  })

  it('changes picture when it is gravatar', () => {
    user.email = 'b@b.com'
    const hash = crypto.createHash('md5').update(user.email).digest('hex')
    expect(user.picture).toBe(`https://gravatar.com/avatar/${hash}?d=identicon`)
  })

  it('does not change picture when it is already set and is not gravatar', () => {
    user.picture = 'not_gravatar.jpg'
    user.email = 'c@c.com'
    expect(user.picture).toBe('not_gravatar.jpg')
  })
})

describe('view', () => {
  it('returns simple view', () => {
    const view = user.view()
    expect(view).toBeDefined()
    expect(view.id).toBe(user.id)
    expect(view.display_name).toBe(user.display_name)
    expect(view.picture).toBe(user.picture)
  })

  it('returns full view', () => {
    const view = user.view(true)
    expect(view).toBeDefined()
    expect(view.id).toBe(user.id)
    expect(view.display_name).toBe(user.display_name)
    expect(view.email).toBe(user.email)
    expect(view.picture).toBe(user.picture)
    expect(view.created_at).toEqual(user.created_at)
  })
})

describe('authenticate', () => {
  it('returns the user when authentication succeed', async () => {
    expect(await user.authenticate('123456')).toBe(user)
  })

  it('returns false when authentication fails', async () => {
    expect(await user.authenticate('blah')).toBe(false)
  })
})
