import request from 'supertest'
import { apiRoot } from '../../config'
import { signSync } from '../../services/jwt'
import express from '../../services/express'
import { User } from '../user'
import routes, { Message } from '.'

const app = () => express(apiRoot, routes)

let userToken, message, user

beforeEach(async () => {
  user = await User.create({ 
    display_name: 'aaa', 
    gender: 'male', 
    email: 'a@a.com', 
    password: '123456' 
  })
  userToken = signSync(user.id)
  message = await Message.create({
    sender: user.id, 
    receiver: user.id, 
    author: user.id, 
    message: {
      text: "Hello world"
    }
  })
  message.setNext('chat_id', (err, doc) => {
    if (err) console.log("Counl't create new chat id: ", err)
  })
})

describe('Message test suite', () => {
  test('POST /messages 201', async () => {
    const { status, body } = await request(app())
      .post(`${apiRoot}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ 
        chat_id: 1, 
        text: "Hello world"
      })
    expect(status).toBe(201)
    expect(typeof body).toEqual('object')
  })

  test('POST /messages 401', async () => {
    const { status } = await request(app())
      .post(`${apiRoot}`)
    expect(status).toBe(401)
  })

  test('GET /messages 200 (user)', async () => {
    const { status, body } = await request(app())
      .get(`${apiRoot}`)
      .set('Authorization', `Bearer ${userToken}`)
    expect(status).toBe(200)
    expect(Array.isArray(body.rows)).toBe(true)
    expect(Number.isNaN(body.count)).toBe(false)
  })

  test('GET /messages 401', async () => {
    const { status } = await request(app())
      .get(`${apiRoot}`)
    expect(status).toBe(401)
  })

  test('GET /messages/:id 200 (user)', async () => {
    const { status, body } = await request(app())
      .get(`${apiRoot}/${message.id}`)
      .set('Authorization', `Bearer ${userToken}`)
    expect(status).toBe(200)
    expect(typeof body).toEqual('object')
    expect(body.id).toEqual(message.id)
  })

  test('GET /messages/:id 401', async () => {
    const { status } = await request(app())
      .get(`${apiRoot}/${message.id}`)
    expect(status).toBe(401)
  })

  test('GET /messages/:id 404 (user)', async () => {
    const { status } = await request(app())
      .get(`${apiRoot}/123456789098765432123456`)
      .set('Authorization', `Bearer ${userToken}`)
    expect(status).toBe(404)
  })
})
