import request from 'supertest'
import { apiRoot } from '../../config'
import { signSync } from '../../services/jwt'
import express from '../../services/express'
import { User } from '../user'
import routes, { Notification } from '.'

const app = () => express(apiRoot, routes)

let userToken, notification, user

beforeEach(async () => {
  user = await User.create({ 
    display_name: 'aaa', 
    gender: 'male', 
    email: 'a@a.com', 
    password: '123456' 
  })
  userToken = signSync(user.id)
  notification = await Notification.create({ 
    recipient: user.id, 
    information: "Notification created", 
    anchor: 'Invitation'
  })
})

describe('Notification test suite', () => {
  test('GET /notifications 200 (user)', async () => {
    const { status, body } = await request(app())
      .get(`${apiRoot}`)
      .set('Authorization', `Bearer ${userToken}`)
    expect(status).toBe(200)
    expect(Array.isArray(body.rows)).toBe(true)
    expect(Number.isNaN(body.count)).toBe(false)
    expect(body.rows[0].recipient).toBe(user.id)
  })
  
  test('GET /notifications 401', async () => {
    const { status } = await request(app())
      .get(`${apiRoot}`)
    expect(status).toBe(401)
  })
  
  test('GET /notifications/:id 200 (user)', async () => {
    const { status, body } = await request(app())
      .get(`${apiRoot}/${notification.id}`)
      .set('Authorization', `Bearer ${userToken}`)
    expect(status).toBe(200)
    expect(typeof body).toEqual('object')
    expect(body.id).toEqual(notification.id)
  })
  
  test('GET /notifications/:id 401', async () => {
    const { status } = await request(app())
      .get(`${apiRoot}/${notification.id}`)
    expect(status).toBe(401)
  })
  
  test('GET /notifications/:id 404 (user)', async () => {
    const { status } = await request(app())
      .get(`${apiRoot}/123456789098765432123456`)
      .set('Authorization', `Bearer ${userToken}`)
    expect(status).toBe(404)
  })
})
