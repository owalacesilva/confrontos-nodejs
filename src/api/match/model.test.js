import { User } from './../user'
import { Team } from './../team'
import { Match } from '.'

let match, team, user

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
  match = await Match.create({ 
    home_team: team, 
    visiting_team: team, 
    address: team.address, 
    sport: team.sport, 
    date: new Date(), 
    start_at: new Date() 
  })
})

describe('view', () => {
  /* test('returns simple view', () => { }) */
  test('returns full view', () => {
    const view = match.view(true)
    expect(typeof view).toBe('object')
    expect(view.id).toBe(match.id)
    expect(view.date).toBe(match.date)
    expect(view.start_at).toBe(match.start_at)
    expect(view.created_at).toBeTruthy()
    expect(view.updated_at).toBeTruthy()
  })

  test('update matches upcoming (pending)', async () => {
    const count = await Match.updateMatchesUpcoming()
    expect(Number.isNaN(count)).toBe(false)
  })

  test('update matches finished (rating)', async () => {
    const count = await Match.updateMatchesFinished()
    expect(Number.isNaN(count)).toBe(false)
  })
})
