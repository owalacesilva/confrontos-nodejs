import { User } from './../user'
import { Team } from './../team'
import { Invitation } from '.'

let invitation, team, user

beforeEach(async () => {
  user = await User.create({ email: 'a@a.com', password: '123456' })
  team = await Team.create({
    display_name: "Team name",
    sport: "soccer",
    user: user.id,
    address: {
      formatted_address: "Rua irumu 57, São Paulo - SP"
    },
    schedule: [{
      day: 0,
      hour: '14:00'
    }]
  })
  invitation = await Invitation.create({ 
    user: user.id,
    team: team.id,
    guest_user: user.id,
    guest_team: team.id,
    date: new Date(), 
    start_at: new Date()
  })
})

describe('view', () => {
  /*it('returns simple view', () => { })*/
  test('returns full view', () => {
    const view = invitation.view(true)
    expect(typeof view).toBe('object')
    expect(view.id).toBe(invitation.id)
    expect(String(view.user)).toBe(user.id)
    expect(String(view.guest_user)).toBe(user.id)
    expect(String(view.team)).toBe(team.id)
    expect(String(view.guest_team)).toBe(team.id)
    expect(view.date).toBe(invitation.date)
    expect(view.start_at).toBe(invitation.start_at)
    expect(view.created_at).toBeTruthy()
    expect(view.updated_at).toBeTruthy()
  })

  test('returns invitation update status (accepted)', async () => {
    const status = 'accepted'
    invitation.status = status
    const saved = await invitation.save()
    expect(saved.id).toBe(invitation.id)
    expect(saved.status).toBe(status)
  })

  test('returns invitation update status (refused)', async () => {
    const status = 'refused'
    invitation.status = status
    const saved = await invitation.save()
    expect(saved.id).toBe(invitation.id)
    expect(saved.status).toBe(status)
  })
})
