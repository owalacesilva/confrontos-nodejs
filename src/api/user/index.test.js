import request from 'supertest'
import { masterKey, apiRoot } from '../../config'
import { signSync } from '../../services/jwt'
import express from '../../services/express'
import routes, { User } from '.'

const app = () => express(apiRoot, routes)

let user1, user2, manager, userToken1, session2, managerSession

beforeEach(async () => {
  user1 = await User.create({ display_name: 'user', email: 'a@a.com', 'gender': 'male', password: '123456' })
  user2 = await User.create({ display_name: 'user', email: 'b@b.com', 'gender': 'female', password: '123456' })
  manager = await User.create({ display_name: 'manager', email: 'c@c.com', 'gender': 'male', password: '123456', role: 'manager' })
  userToken1 = signSync(user1.id)
  session2 = signSync(user2.id)
  managerSession = signSync(manager.id)
})

describe('User test suite', () => {
  test('GET /users 200', async () => {
    const { status, body } = await request(app())
      .get(`${apiRoot}`)
      .set('Authorization', `Bearer ${userToken1}`)
    expect(status).toBe(200)
    expect(Array.isArray(body.rows)).toBe(true)
    expect(Number.isNaN(body.count)).toBe(false)
  })
  
  test('GET /users?page=2&limit=1 200', async () => {
    const { status, body } = await request(app())
      .get(`${apiRoot}`)
      .set('Authorization', `Bearer ${userToken1}`)
      .query({ page: 2, limit: 1 })
    expect(status).toBe(200)
    expect(Array.isArray(body.rows)).toBe(true)
    expect(Number.isNaN(body.count)).toBe(false)
    expect(body.rows.length).toBe(1)
  })
  
  test('GET /users?q=user 200', async () => {
    const { status, body } = await request(app())
      .get(`${apiRoot}`)
      .set('Authorization', `Bearer ${userToken1}`)
      .query({ q: 'user' })
    expect(status).toBe(200)
    expect(Array.isArray(body.rows)).toBe(true)
    expect(Number.isNaN(body.count)).toBe(false)
    expect(body.rows.length).toBe(2)
  })
  
  test('GET /users?fields=display_name 200', async () => {
    const { status, body } = await request(app())
      .get(`${apiRoot}`)
      .set('Authorization', `Bearer ${userToken1}`)
      .query({ fields: 'display_name' })
    expect(status).toBe(200)
    expect(Array.isArray(body.rows)).toBe(true)
    expect(Number.isNaN(body.count)).toBe(false)
    expect(Object.keys(body.rows[0])).toEqual(['display_name'])
  })
  
  test('GET /users 401', async () => {
    const { status } = await request(app())
      .get(`${apiRoot}`)
    expect(status).toBe(401)
  })
  
  test('GET /users/me 200 (user)', async () => {
    const { status, body } = await request(app())
      .get(`${apiRoot}/me`)
      .set('Authorization', `Bearer ${userToken1}`)
    expect(status).toBe(200)
    expect(typeof body).toBe('object')
    expect(body.id).toBe(user1.id)
  })
  
  test('GET /users/me 401', async () => {
    const { status } = await request(app())
      .get(`${apiRoot}/me`)
    expect(status).toBe(401)
  })
  
  test('GET /users/:user_id 200', async () => {
    const { status, body } = await request(app())
      .get(`${apiRoot}/${user1.user_id}`)
    expect(status).toBe(200)
    expect(typeof body).toBe('object')
    expect(body.user_id).toBe(user1.user_id)
  })
  
  test('GET /users/:id 404', async () => {
    const { status } = await request(app())
      .get(`${apiRoot}/123456789098765432123456`)
    expect(status).toBe(404)
  })
  
  test('POST /users 201', async () => {
    const { status, body } = await request(app())
      .post(`${apiRoot}`)
      .send({ display_name: 'ddd', gender: 'male', email: 'd@d.com', password: '123456' })
    expect(status).toBe(201)
    expect(typeof body).toBe('object')
    expect(typeof body.user).toBe('object')
    expect(typeof body.token).toBe('string')
    expect(body.user.email).toBe('d@d.com')
  })
  
  test('POST /users 201 (manager)', async () => {
    const { status, body } = await request(app())
      .post(`${apiRoot}`)
      .send({ display_name: 'eee', gender: 'male', email: 'e@e.com', password: '123456', role: 'manager' })
    expect(status).toBe(201)
    expect(typeof body).toBe('object')
    expect(typeof body.user).toBe('object')
    expect(typeof body.token).toBe('string')
    expect(body.user.role).toBe('manager')
  })
  
  test('POST /users 409 - duplicated email', async () => {
    const { status, body } = await request(app())
      .post(`${apiRoot}`)
      .send({ display_name: 'aaa', gender: 'male', email: 'a@a.com', password: '123456' })
    expect(status).toBe(409)
    expect(typeof body).toBe('object')
    expect(body.param).toBe('email')
  })
  
  test('POST /users 400 - invalid email', async () => {
    const { status, body } = await request(app())
      .post(`${apiRoot}`)
      .send({ display_name: 'aaa', gender: 'male', email: 'invalid', password: '123456' })
    expect(status).toBe(400)
    expect(typeof body).toBe('object')
    expect(body.param).toBe('email')
  })
  
  test('POST /users 400 - missing email', async () => {
    const { status, body } = await request(app())
      .post(`${apiRoot}`)
      .send({ password: '123456' })
      .send({ display_name: 'aaa', gender: 'male', password: '123456' })
    expect(status).toBe(400)
    expect(typeof body).toBe('object')
    expect(body.param).toBe('email')
  })
  
  test('POST /users 400 - invalid password', async () => {
    const { status, body } = await request(app())
      .post(`${apiRoot}`)
      .send({ display_name: 'ddd', gender: 'male', email: 'd@d.com', password: '123' })
    expect(status).toBe(400)
    expect(typeof body).toBe('object')
    expect(body.param).toBe('password')
  })
  
  test('POST /users 400 - missing password', async () => {
    const { status, body } = await request(app())
      .post(`${apiRoot}`)
      .send({ display_name: 'ddd', gender: 'male', email: 'd@d.com' })
    expect(status).toBe(400)
    expect(typeof body).toBe('object')
    expect(body.param).toBe('password')
  })
  
  test('POST /users 400 - invalid role', async () => {
    const { status, body } = await request(app())
      .post(`${apiRoot}`)
      .send({ display_name: 'fff', gender: 'male', email: 'f@f.com', password: '123456', role: 'invalid' })
    expect(status).toBe(400)
    expect(typeof body).toBe('object')
    expect(body.param).toBe('role')
  })
  
  /*test('PUT /users/me 200', async () => {
    const { status, body } = await request(app())
      .put(`${apiRoot}/me`)
      .set('Authorization', `Bearer ${userToken1}`)
      .send({ display_name: 'test' })
    expect(status).toBe(200)
    expect(typeof body).toBe('object')
    expect(body.display_name).toBe('test')
  })
  
  test('PUT /users/me 200', async () => {
    const { status, body } = await request(app())
      .put(`${apiRoot}/me`)
      .set('Authorization', `Bearer ${userToken1}`)
      .send({ email: 'test@test.com' })
    expect(status).toBe(200)
    expect(typeof body).toBe('object')
    expect(body.email).toBe('a@a.com')
  })
  
  test('PUT /users/me 401', async () => {
    const { status } = await request(app())
      .put(`${apiRoot}/me`)
      .send({ display_name: 'test' })
    expect(status).toBe(401)
  })
  
  const passwordMatch = async (password, userId) => {
    const user = await User.findById(userId)
    return !!await user.authenticate(password)
  }
  
  test('PUT /users/me/password 200', async () => {
    const { status, body } = await request(app())
      .put(`${apiRoot}/me/password`)
      .set('Authorization', `Bearer ${userToken1}`)
      .send({ password: '654321' })
    expect(status).toBe(200)
    expect(typeof body).toBe('object')
    expect(body.email).toBe('a@a.com')
    expect(await passwordMatch('654321', body.id)).toBe(true)
  })
  
  test('PUT /users/me/password 400 - invalid password', async () => {
    const { status, body } = await request(app())
      .put(`${apiRoot}/me/password`)
      .set('Authorization', `Bearer ${userToken1}`)
      .send({ password: '321' })
    expect(status).toBe(400)
    expect(typeof body).toBe('object')
    expect(body.param).toBe('password')
  })
  
  test('PUT /users/me/password 401', async () => {
    const { status } = await request(app())
      .put(`${apiRoot}/me/password`)
      .send({ password: '654321' })
    expect(status).toBe(401)
  })*/

  test('POST /users/follow 201', async () => {
    const { status } = await request(app())
      .post(`${apiRoot}/follow`)
      .set('Authorization', `Bearer ${userToken1}`)
      .send({ user_id: user2.user_id })
    expect(status).toBe(201)
  })

  test('POST /users/follow 404', async () => {
    const { status } = await request(app())
      .post(`${apiRoot}/follow`)
      .set('Authorization', `Bearer ${userToken1}`)
    expect(status).toBe(404)
  })

  test('POST /users/follow 401', async () => {
    const { status } = await request(app())
      .post(`${apiRoot}/follow`)
      .send({ user_id: user2.user_id })
    expect(status).toBe(401)
  })

  test('DELETE /users/unfollow 201', async () => {
    const { status } = await request(app())
      .delete(`${apiRoot}/unfollow`)
      .set('Authorization', `Bearer ${userToken1}`)
      .send({ user_id: user2.user_id })
    expect(status).toBe(201)
  })

  test('DELETE /users/unfollow 404', async () => {
    const { status } = await request(app())
      .delete(`${apiRoot}/unfollow`)
      .set('Authorization', `Bearer ${userToken1}`)
    expect(status).toBe(404)
  })

  test('DELETE /users/unfollow 401', async () => {
    const { status } = await request(app())
      .delete(`${apiRoot}/unfollow`)
      .send({ user_id: user2.user_id })
    expect(status).toBe(401)
  })
})
