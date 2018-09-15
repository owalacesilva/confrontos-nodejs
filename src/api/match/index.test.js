import request from 'supertest'
import { signSync } from '../../services/jwt'
import { User } from './../user'
import { Team } from './../team'
import { apiRoot } from '../../config'
import express from '../../services/express'
import routes, { Match } from '.'

const app = () => express(apiRoot, routes)

let userToken, match, team, user
let stats = [{
  name: 'points',
  label: 'Gols',
  home_team_score: 3,
  visiting_team_score: 0
},{
  name: 'corners',
  label: 'Escanteios',
  home_team_score: 1,
  visiting_team_score: 2
}]

beforeEach(async () => {
  user = await User.create({ email: 'a@a.com', password: '123456' })
  userToken = signSync(user.id)
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
      .get(`${apiRoot}`)
    expect(status).toBe(200)
    expect(Array.isArray(body.rows)).toBe(true)
    expect(Number.isNaN(body.count)).toBe(false)
  })

  test('GET /matches/:id 200', async () => {
    const { status, body } = await request(app())
      .get(`${apiRoot}/${match.id}`)
    expect(status).toBe(200)
    expect(typeof body).toEqual('object')
    expect(body.id).toEqual(match.id)
  })

  test('GET /matches/:id 404', async () => {
    const { status } = await request(app())
      .get(`${apiRoot}/123456789098765432123456`)
    expect(status).toBe(404)
  })

  test('POST /matches/:id/revision 201 (avoid duplicate)', async () => {
    const { status, body } = await request(app())
      .post(`${apiRoot}/${match.id}/revision`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ stats })
    expect(status).toBe(201)
    expect(typeof body).toEqual('object')
    expect(body.id).toEqual(match.id)
    expect(typeof body.revisions).toEqual('object')
    expect(body.revisions.length).toBeGreaterThan(0)
    expect(body.revisions[0].user).toEqual(user.id)
    expect(body.revisions[0].stats[0].name).toEqual(stats[0].name)
  })

  test('POST /matches/:id/revision 401', async () => {
    const { status } = await request(app())
      .post(`${apiRoot}/${match.id}/revision`)
    expect(status).toBe(401)
  })

  test('POST /matches/:id/revision 404', async () => {
    const { status } = await request(app())
      .post(`${apiRoot}/123456789098765432123456/revision`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ stats })
    expect(status).toBe(404)
  })
})
