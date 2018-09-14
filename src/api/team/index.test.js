import request from 'supertest'
import { apiRoot } from '../../config'
import { signSync } from '../../services/jwt'
import express from '../../services/express'
import { User } from '../user'
import routes, { Team } from '.'

const app = () => express(apiRoot, routes)

let userSession, team, user

beforeEach(async () => {
  user = await User.create({ email: 'a@a.com', password: '123456' })
  userSession = signSync(user.id) // create new session
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

describe('Team test suite', () => {
  test('POST /teams 201', async () => {
    const { status, body } = await request(app())
      .post("/")
      .send({ 
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
    expect(status).toBe(201)
    expect(typeof body).toEqual('object')
    expect(body.user).toEqual(user.id)
    expect(body.display_name).toEqual('Team name')
    expect(body.sport).toEqual('soccer')
  })

  test('GET /teams 200', async () => {
    const { status, body } = await request(app())
      .get('/')
    expect(status).toBe(200)
    expect(Array.isArray(body.rows)).toBe(true)
    expect(Number.isNaN(body.count)).toBe(false)
  })

  test('GET /teams/:id 200', async () => {
    const { status, body } = await request(app())
      .get(`/${team.id}`)
    expect(status).toBe(200)
    expect(typeof body).toEqual('object')
    expect(body.id).toEqual(team.id)
  })
  
  test('GET /teams/:id 404', async () => {
    const { status } = await request(app())
      .get('/123456789098765432123456')
    expect(status).toBe(404)
  })
  
  test('PUT /teams/:id 200 (user)', async () => {
    const { status, body } = await request(app())
      .put(`/${team.id}`)
      .send({ access_token: userSession, display_name: 'Team name changed' })
    expect(status).toBe(200)
    expect(typeof body).toEqual('object')
    expect(body.id).toEqual(team.id)
    expect(body.display_name).toEqual('Team name changed')
  })
  
  test('PUT /teams/:id 401', async () => {
    const { status } = await request(app())
      .put(`/${team.id}`)
    expect(status).toBe(401)
  })
  
  test('PUT /teams/:id 404 (user)', async () => {
    const { status } = await request(app())
      .put('/123456789098765432123456')
      .send({ access_token: userSession, display_name: 'Team name changed' })
    expect(status).toBe(404)
  })
})
