import request from 'supertest'
import { User } from './../user'
import { Team } from './../team'
import { apiRoot } from '../../config'
import express from '../../services/express'
import routes, { Match } from '.'

const app = () => express(apiRoot, routes)

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

describe('Match test suite', () => {
  test('GET /matches 200', async () => {
    const { status, body } = await request(app())
      .get('/')
    expect(status).toBe(200)
    expect(Array.isArray(body.rows)).toBe(true)
    expect(Number.isNaN(body.count)).toBe(false)
  })

  test('GET /matches/:id 200', async () => {
    const { status, body } = await request(app())
      .get(`/${match.id}`)
    expect(status).toBe(200)
    expect(typeof body).toEqual('object')
    expect(body.id).toEqual(match.id)
  })

  test('GET /matches/:id 404', async () => {
    const { status } = await request(app())
      .get('/123456789098765432123456')
    expect(status).toBe(404)
  })
})
