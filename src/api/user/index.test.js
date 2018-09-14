import request from 'supertest'
import { masterKey, apiRoot } from '../../config'
import { signSync } from '../../services/jwt'
import express from '../../services/express'
import routes, { User } from '.'

const app = () => express(apiRoot, routes)

let user1, user2, manager, session1, session2, managerSession

beforeEach(async () => {
  user1 = await User.create({ display_name: 'user', email: 'a@a.com', password: '123456' })
  user2 = await User.create({ display_name: 'user', email: 'b@b.com', password: '123456' })
  manager = await User.create({ display_name: 'manager', email: 'c@c.com', password: '123456', role: 'manager' })
  session1 = signSync(user1.id)
  session2 = signSync(user2.id)
  managerSession = signSync(manager.id)
})

describe('User test suite', () => {
  test('GET /users 200 (manager)', async () => {
    const { status, body } = await request(app())
      .get('/')
      .query({ access_token: managerSession })
    expect(status).toBe(200)
    expect(Array.isArray(body.rows)).toBe(true)
    expect(Number.isNaN(body.count)).toBe(false)
  })
  
  test('GET /users?page=2&limit=1 200 (manager)', async () => {
    const { status, body } = await request(app())
      .get('/')
      .query({ access_token: managerSession, page: 2, limit: 1 })
    expect(status).toBe(200)
    expect(Array.isArray(body.rows)).toBe(true)
    expect(Number.isNaN(body.count)).toBe(false)
    expect(body.rows.length).toBe(1)
  })
  
  test('GET /users?q=user 200 (manager)', async () => {
    const { status, body } = await request(app())
      .get('/')
      .query({ access_token: managerSession, q: 'user' })
    expect(status).toBe(200)
    expect(Array.isArray(body.rows)).toBe(true)
    expect(Number.isNaN(body.count)).toBe(false)
    expect(body.rows.length).toBe(2)
  })
  
  test('GET /users?fields=display_name 200 (manager)', async () => {
    const { status, body } = await request(app())
      .get('/')
      .query({ access_token: managerSession, fields: 'display_name' })
    expect(status).toBe(200)
    expect(Array.isArray(body.rows)).toBe(true)
    expect(Number.isNaN(body.count)).toBe(false)
    expect(Object.keys(body.rows[0])).toEqual(['id', 'display_name'])
  })
  
  test('GET /users 401 (user)', async () => {
    const { status } = await request(app())
      .get('/')
      .query({ access_token: session1 })
    expect(status).toBe(401)
  })
  
  test('GET /users 401', async () => {
    const { status } = await request(app())
      .get('/')
    expect(status).toBe(401)
  })
  
  test('GET /users/me 200 (user)', async () => {
    const { status, body } = await request(app())
      .get('/me')
      .query({ access_token: session1 })
    expect(status).toBe(200)
    expect(typeof body).toBe('object')
    expect(body.id).toBe(user1.id)
  })
  
  test('GET /users/me 401', async () => {
    const { status } = await request(app())
      .get('/me')
    expect(status).toBe(401)
  })
  
  test('GET /users/:id 200', async () => {
    const { status, body } = await request(app())
      .get(`/${user1.id}`)
    expect(status).toBe(200)
    expect(typeof body).toBe('object')
    expect(body.id).toBe(user1.id)
  })
  
  test('GET /users/:id 404', async () => {
    const { status } = await request(app())
      .get('/123456789098765432123456')
    expect(status).toBe(404)
  })
  
  test('POST /users 201 (master)', async () => {
    const { status, body } = await request(app())
      .post('/')
      .send({ 
        // access_token: masterKey, 
        display_name: 'ddd', 
        email: 'd@d.com', 
        password: '123456' 
      })
    expect(status).toBe(201)
    expect(typeof body).toBe('object')
    expect(typeof body.user).toBe('object')
    expect(typeof body.token).toBe('string')
    expect(body.user.email).toBe('d@d.com')
  })
  
  test('POST /users 201 (master)', async () => {
    const { status, body } = await request(app())
      .post('/')
      .send({ 
        // access_token: masterKey, 
        display_name: 'eee', 
        email: 'e@e.com', 
        password: '123456',
        role: 'manager' 
      })
    expect(status).toBe(201)
    expect(typeof body).toBe('object')
    expect(typeof body.user).toBe('object')
    expect(typeof body.token).toBe('string')
    expect(body.user.role).toBe('manager')
  })
  
  test('POST /users 201 (master)', async () => {
    const { status, body } = await request(app())
      .post('/')
      .send({ 
        // access_token: masterKey, 
        display_name: 'fff', 
        email: 'f@f.com', 
        password: '123456',
        role: 'manager' 
      })
    expect(status).toBe(201)
    expect(typeof body).toBe('object')
    expect(typeof body.user).toBe('object')
    expect(typeof body.token).toBe('string')
    expect(body.user.email).toBe('f@f.com')
  })
  
  test('POST /users 409 (master) - duplicated email', async () => {
    const { status, body } = await request(app())
      .post('/')
      .send({ access_token: masterKey, email: 'a@a.com', password: '123456' })
    expect(status).toBe(409)
    expect(typeof body).toBe('object')
    expect(body.param).toBe('email')
  })
  
  test('POST /users 400 (master) - invalid email', async () => {
    const { status, body } = await request(app())
      .post('/')
      .send({ access_token: masterKey, email: 'invalid', password: '123456' })
    expect(status).toBe(400)
    expect(typeof body).toBe('object')
    expect(body.param).toBe('email')
  })
  
  test('POST /users 400 (master) - missing email', async () => {
    const { status, body } = await request(app())
      .post('/')
      .send({ access_token: masterKey, password: '123456' })
    expect(status).toBe(400)
    expect(typeof body).toBe('object')
    expect(body.param).toBe('email')
  })
  
  test('POST /users 400 (master) - invalid password', async () => {
    const { status, body } = await request(app())
      .post('/')
      .send({ access_token: masterKey, email: 'd@d.com', password: '123' })
    expect(status).toBe(400)
    expect(typeof body).toBe('object')
    expect(body.param).toBe('password')
  })
  
  test('POST /users 400 (master) - missing password', async () => {
    const { status, body } = await request(app())
      .post('/')
      .send({ access_token: masterKey, email: 'd@d.com' })
    expect(status).toBe(400)
    expect(typeof body).toBe('object')
    expect(body.param).toBe('password')
  })
  
  test('POST /users 400 (master) - invalid role', async () => {
    const { status, body } = await request(app())
      .post('/')
      .send({ access_token: masterKey, email: 'd@d.com', password: '123456', role: 'invalid' })
    expect(status).toBe(400)
    expect(typeof body).toBe('object')
    expect(body.param).toBe('role')
  })
  
  test('POST /users 401 (manager)', async () => {
    const { status } = await request(app())
      .post('/')
      .send({ access_token: managerSession, email: 'd@d.com', password: '123456' })
    expect(status).toBe(401)
  })
  
  test('POST /users 401 (user)', async () => {
    const { status } = await request(app())
      .post('/')
      .send({ access_token: session1, email: 'd@d.com', password: '123456' })
    expect(status).toBe(401)
  })
  
  test('POST /users 401', async () => {
    const { status } = await request(app())
      .post('/')
      .send({ email: 'd@d.com', password: '123456' })
    expect(status).toBe(401)
  })
  
  test('PUT /users/me 200 (user)', async () => {
    const { status, body } = await request(app())
      .put('/me')
      .send({ access_token: session1, display_name: 'test' })
    expect(status).toBe(200)
    expect(typeof body).toBe('object')
    expect(body.display_name).toBe('test')
  })
  
  test('PUT /users/me 200 (user)', async () => {
    const { status, body } = await request(app())
      .put('/me')
      .send({ access_token: session1, email: 'test@test.com' })
    expect(status).toBe(200)
    expect(typeof body).toBe('object')
    expect(body.email).toBe('a@a.com')
  })
  
  test('PUT /users/me 401', async () => {
    const { status } = await request(app())
      .put('/me')
      .send({ display_name: 'test' })
    expect(status).toBe(401)
  })
  
  test('PUT /users/:id 200 (user)', async () => {
    const { status, body } = await request(app())
      .put(`/${user1.id}`)
      .send({ access_token: session1, display_name: 'test' })
    expect(status).toBe(200)
    expect(typeof body).toBe('object')
    expect(body.display_name).toBe('test')
  })
  
  test('PUT /users/:id 200 (user)', async () => {
    const { status, body } = await request(app())
      .put(`/${user1.id}`)
      .send({ access_token: session1, email: 'test@test.com' })
    expect(status).toBe(200)
    expect(typeof body).toBe('object')
    expect(body.email).toBe('a@a.com')
  })
  
  test('PUT /users/:id 200 (manager)', async () => {
    const { status, body } = await request(app())
      .put(`/${user1.id}`)
      .send({ access_token: managerSession, display_name: 'test' })
    expect(status).toBe(200)
    expect(typeof body).toBe('object')
    expect(body.display_name).toBe('test')
  })
  
  test('PUT /users/:id 401 (user) - another user', async () => {
    const { status } = await request(app())
      .put(`/${user1.id}`)
      .send({ access_token: session2, display_name: 'test' })
    expect(status).toBe(401)
  })
  
  test('PUT /users/:id 401', async () => {
    const { status } = await request(app())
      .put(`/${user1.id}`)
      .send({ display_name: 'test' })
    expect(status).toBe(401)
  })
  
  test('PUT /users/:id 404 (manager)', async () => {
    const { status } = await request(app())
      .put('/123456789098765432123456')
      .send({ access_token: managerSession, display_name: 'test' })
    expect(status).toBe(404)
  })
  
  const passwordMatch = async (password, userId) => {
    const user = await User.findById(userId)
    return !!await user.authenticate(password)
  }
  
  test('PUT /users/me/password 200 (user)', async () => {
    const { status, body } = await request(app())
      .put('/me/password')
      .auth('a@a.com', '123456')
      .send({ password: '654321' })
    expect(status).toBe(200)
    expect(typeof body).toBe('object')
    expect(body.email).toBe('a@a.com')
    expect(await passwordMatch('654321', body.id)).toBe(true)
  })
  
  test('PUT /users/me/password 400 (user) - invalid password', async () => {
    const { status, body } = await request(app())
      .put('/me/password')
      .auth('a@a.com', '123456')
      .send({ password: '321' })
    expect(status).toBe(400)
    expect(typeof body).toBe('object')
    expect(body.param).toBe('password')
  })
  
  test('PUT /users/me/password 401 (user) - invalid authentication method', async () => {
    const { status } = await request(app())
      .put('/me/password')
      .send({ access_token: session1, password: '654321' })
    expect(status).toBe(401)
  })
  
  test('PUT /users/me/password 401', async () => {
    const { status } = await request(app())
      .put('/me/password')
      .send({ password: '654321' })
    expect(status).toBe(401)
  })
  
  test('PUT /users/:id/password 200 (user)', async () => {
    const { status, body } = await request(app())
      .put(`/${user1.id}/password`)
      .auth('a@a.com', '123456')
      .send({ password: '654321' })
    expect(status).toBe(200)
    expect(typeof body).toBe('object')
    expect(body.email).toBe('a@a.com')
    expect(await passwordMatch('654321', body.id)).toBe(true)
  })
  
  test('PUT /users/:id/password 400 (user) - invalid password', async () => {
    const { status, body } = await request(app())
      .put(`/${user1.id}/password`)
      .auth('a@a.com', '123456')
      .send({ password: '321' })
    expect(status).toBe(400)
    expect(typeof body).toBe('object')
    expect(body.param).toBe('password')
  })
  
  test('PUT /users/:id/password 401 (user) - another user', async () => {
    const { status } = await request(app())
      .put(`/${user1.id}/password`)
      .auth('b@b.com', '123456')
      .send({ password: '654321' })
    expect(status).toBe(401)
  })
  
  test('PUT /users/:id/password 401 (user) - invalid authentication method', async () => {
    const { status } = await request(app())
      .put(`/${user1.id}/password`)
      .send({ access_token: session1, password: '654321' })
    expect(status).toBe(401)
  })
  
  test('PUT /users/:id/password 401', async () => {
    const { status } = await request(app())
      .put(`/${user1.id}/password`)
      .send({ password: '654321' })
    expect(status).toBe(401)
  })
  
  test('PUT /users/:id/password 404 (user)', async () => {
    const { status } = await request(app())
      .put('/123456789098765432123456/password')
      .auth('a@a.com', '123456')
      .send({ password: '654321' })
    expect(status).toBe(404)
  })
  
  test('DELETE /users/:id 204 (manager)', async () => {
    const { status } = await request(app())
      .delete(`/${user1.id}`)
      .send({ access_token: managerSession })
    expect(status).toBe(204)
  })
  
  test('DELETE /users/:id 401 (user)', async () => {
    const { status } = await request(app())
      .delete(`/${user1.id}`)
      .send({ access_token: session1 })
    expect(status).toBe(401)
  })
  
  test('DELETE /users/:id 401', async () => {
    const { status } = await request(app())
      .delete(`/${user1.id}`)
    expect(status).toBe(401)
  })
  
  test('DELETE /users/:id 404 (manager)', async () => {
    const { status } = await request(app())
      .delete('/123456789098765432123456')
      .send({ access_token: managerSession })
    expect(status).toBe(404)
  })
})
