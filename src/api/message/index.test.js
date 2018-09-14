import request from 'supertest'
import { apiRoot } from '../../config'
import { signSync } from '../../services/jwt'
import express from '../../services/express'
import { User } from '../user'
import routes, { Message } from '.'

const app = () => express(apiRoot, routes)

let userSession, message, user

beforeEach(async () => {
  user = await User.create({ email: 'a@a.com', password: '123456' })
  userSession = signSync(user.id)
  message = await Message.create({
    sender: user.id, 
    receiver: user.id, 
    author: user.id, 
    message: {
      text: "Hello world"
    }
  })
})

describe('Message test suite', () => {
  test('POST /messages 201 (user)', async () => {
    const { status, body } = await request(app())
      .post('/')
      .send({ 
        access_token: userSession, 
        sender: user.id, 
        receiver: user.id, 
        author: user.id, 
        message: {
          text: "Hello world"
        }
      })
    expect(status).toBe(201)
    expect(typeof body).toEqual('object')
  })

  test('POST /messages 401', async () => {
    const { status } = await request(app())
      .post('/')
    expect(status).toBe(401)
  })

  test('GET /messages 200 (user)', async () => {
    const { status, body } = await request(app())
      .get('/')
      .query({ access_token: userSession })
    expect(status).toBe(200)
    expect(Array.isArray(body.rows)).toBe(true)
    expect(Number.isNaN(body.count)).toBe(false)
  })

  test('GET /messages 401', async () => {
    const { status } = await request(app())
      .get('/')
    expect(status).toBe(401)
  })

  test('GET /messages/:id 200 (user)', async () => {
    const { status, body } = await request(app())
      .get(`/${message.id}`)
      .query({ access_token: userSession })
    expect(status).toBe(200)
    expect(typeof body).toEqual('object')
    expect(body.id).toEqual(message.id)
  })

  test('GET /messages/:id 401', async () => {
    const { status } = await request(app())
      .get(`/${message.id}`)
    expect(status).toBe(401)
  })

  test('GET /messages/:id 404 (user)', async () => {
    const { status } = await request(app())
      .get('/123456789098765432123456')
      .query({ access_token: userSession })
    expect(status).toBe(404)
  })
})
