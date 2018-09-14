import { User } from './../user'
import { Notification } from '.'

let notification, user

beforeEach(async () => {
  user = await User.create({ email: 'a@a.com', password: '123456' })
  notification = await Notification.create({ 
    recipient: user.id, 
    information: "Notification created", 
    anchor: 'Invitation', 
    read: false 
  })
})

describe('view', () => {
  /*it('returns simple view', () => {
    const view = notification.view()
    expect(typeof view).toBe('object')
    expect(view.id).toBe(notification.id)
    expect(view.read).toBe(notification.read)
    expect(view.created_at).toBeTruthy()
    expect(view.updated_at).toBeTruthy()
  })*/

  it('returns full view', () => {
    const view = notification.view(true)
    expect(typeof view).toBe('object')
    expect(view.id).toBe(notification.id)
    expect(String(view.recipient)).toBe(user.id)
    expect(view.anchor).toBe(notification.anchor)
    //expect(view.push_sent).toBeTruthy()
    expect(view.created_at).toBeTruthy()
    expect(view.updated_at).toBeTruthy()
  })

  test('returns new notification', async () => {
    const doc = await Notification.notify('invitation_created', {
      user: { display_name: 'test user' },
      guest_team: { display_name: 'test team' },
      date: new Date(),
    }, { 
      invitation_id: user.id, 
      recipient: user.id 
    })
    expect(typeof doc).toBe('object')
    expect(doc.id).toBeTruthy()
    expect(doc.anchor).toBe('Invitation')
    expect(doc.created_at).toBeTruthy()
  })

  test('returns invitation status changed (accepted)', async () => {
    const doc = await Notification.notify('invitation_status_changed', {
      user: { display_name: 'test user' },
      guest_team: { display_name: 'test team' },
      date: new Date(),
    }, { 
      match_id: user.id, 
      recipient: user.id, 
      status: 'accepted' 
    })
    expect(typeof doc).toBe('object')
    expect(doc.id).toBeTruthy()
    expect(doc.anchor).toBe('Match')
    expect(doc.created_at).toBeTruthy()
  })

  test('returns invitation status changed (refused)', async () => {
    const doc = await Notification.notify('invitation_status_changed', {
      user: { display_name: 'test user' },
      guest_team: { display_name: 'test team' },
      date: new Date(),
    }, { 
      match_id: user.id, 
      recipient: user.id, 
      status: 'refused' 
    })
    expect(typeof doc).toBe('object')
    expect(doc.id).toBeTruthy()
    expect(doc.anchor).toBe('Match')
    expect(doc.created_at).toBeTruthy()
  })
})
