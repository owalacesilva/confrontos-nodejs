import request from 'supertest'
import { apiRoot } from '../../config'
import { signSync } from '../../services/jwt'
import express from '../../services/express'
import { User } from '../user'
import { Team } from './../team'
import routes, { Invitation } from '.'

const app = () => express(apiRoot, routes)

let userToken, invitation, user, team

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
  invitation = await Invitation.create({ 
    user: user.id,
    team: team.id,
    guest_user: user.id,
    guest_team: team.id,
    date: new Date(), 
    start_at: new Date()
  })
})

describe('Invitation test suite', () => {
  test('POST /invitations 201 (user)', async () => {
    const { status, body, error } = await request(app())
      .post(`${apiRoot}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ 
        guest_user: user.id,
        team: team.id,
        guest_team: team.id,
        date: new Date(), 
        start_at: new Date()
      })
    expect(status).toBe(201)
    expect(typeof body).toEqual('object')
    expect(typeof body.id).toEqual('string')
    expect(body.user).toBe(user.id)
  })

  test('POST /invitations 401', async () => {
    const { status } = await request(app())
      .post(`${apiRoot}`)
    expect(status).toBe(401)
  })

  test('GET /invitations 200 (user)', async () => {
    const { status, body } = await request(app())
      .get(`${apiRoot}`)
      .set('Authorization', `Bearer ${userToken}`)
    expect(status).toBe(200)
    expect(Array.isArray(body.rows)).toBe(true)
    expect(Number.isNaN(body.count)).toBe(false)
  })

  test('GET /invitations 401', async () => {
    const { status } = await request(app())
      .get(`${apiRoot}`)
    expect(status).toBe(401)
  })

  test('GET /invitations/:id 200 (user)', async () => {
    const { status, body } = await request(app())
      .get(`${apiRoot}/${invitation.id}`)
      .set('Authorization', `Bearer ${userToken}`)
    expect(status).toBe(200)
    expect(typeof body).toEqual('object')
    expect(body.id).toEqual(invitation.id)
  })

  test('GET /invitations/:id 401', async () => {
    const { status } = await request(app())
      .get(`${apiRoot}/${invitation.id}`)
    expect(status).toBe(401)
  })

  test('GET /invitations/:id 404 (user)', async () => {
    const { status } = await request(app())
      .get(`${apiRoot}/123456789098765432123456`)
      .set('Authorization', `Bearer ${userToken}`)
    expect(status).toBe(404)
  })

  test('PUT /invitations/:id 200 (user)', async () => {
    const { status, body } = await request(app())
      .put(`${apiRoot}/${invitation.id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ date: new Date(), start_at: new Date() })
    expect(status).toBe(200)
    expect(typeof body).toEqual('object')
    expect(body.id).toEqual(invitation.id)
    expect(body.date).toBeTruthy()
    expect(body.start_at).toBeTruthy()
  })

  test('PUT /invitations/:id 401', async () => {
    const { status } = await request(app())
      .put(`${apiRoot}/${invitation.id}`)
    expect(status).toBe(401)
  })

  test('PUT /invitations/:id 404 (user)', async () => {
    const { status } = await request(app())
      .put(`${apiRoot}/123456789098765432123456`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ date: new Date(), start_at: new Date() })
    expect(status).toBe(404)
  })

  test('PUT /invitations/:id 200 (change status)', async () => {
    const { status, body } = await request(app())
      .put(`${apiRoot}/${invitation.id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ status: 'accepted' })
    expect(status).toBe(200)
    expect(typeof body).toEqual('object')
    expect(body.id).toEqual(invitation.id)
    expect(body.status).toBe('accepted')
    // expect(body.match).toBeTruthy() // create new match
  })

  test('DELETE /invitations/:id 204 (user)', async () => {
    const { status } = await request(app())
      .delete(`${apiRoot}/${invitation.id}`)
      .set('Authorization', `Bearer ${userToken}`)
    expect(status).toBe(204)
  })

  test('DELETE /invitations/:id 401', async () => {
    const { status } = await request(app())
      .delete(`${apiRoot}/${invitation.id}`)
    expect(status).toBe(401)
  })

  test('DELETE /invitations/:id 404 (user)', async () => {
    const { status } = await request(app())
      .delete(`${apiRoot}/123456789098765432123456`)
      .set('Authorization', `Bearer ${userToken}`)
    expect(status).toBe(404)
  })
})
