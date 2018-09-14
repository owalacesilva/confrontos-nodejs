import { User } from '../user'
import { Team } from '.'

let team, user

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
})

describe('view', () => {
  it('returns simple view', () => {
    const view = team.view()
    expect(typeof view).toBe('object')
    expect(view.id).toBe(team.id)
    expect(String(view.user)).toBe(user.id)
    expect(view.display_name).toBe(team.display_name)
    expect(view.sport).toBe(team.sport)
    expect(view.abbr).toMatch(/^[A-Z]+$/g)
    expect(view.slug).toBe('team-name')
    expect(view.address).toBe(team.address)
    expect(view.schedule).toBe(team.schedule)
    expect(view.created_at).toBeTruthy()
    expect(view.updated_at).toBeTruthy()
  })

  it('returns full view', () => {
    const view = team.view(true)
    expect(typeof view).toBe('object')
    expect(view.id).toBe(team.id)
    expect(String(view.user)).toBe(user.id)
    expect(view.display_name).toBe(team.display_name)
    expect(view.sport).toBe(team.sport)
    expect(view.abbr).toBe(team.abbr)
    expect(view.address).toBe(team.address)
    expect(view.schedule).toBe(team.schedule)
    expect(view.created_at).toBeTruthy()
    expect(view.updated_at).toBeTruthy()
  })
})
