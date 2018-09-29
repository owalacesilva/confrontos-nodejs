import request from 'supertest'
import { apiRoot } from '../../config'
import { signSync } from '../../services/jwt'
import express from '../../services/express'
import { User } from '../user'
import Activity from '../activity'
import routes, { FeedNews } from '.'

const app = () => express(apiRoot, routes)

let userToken, user, feedNews, activity

beforeEach(async () => {
  user = await User.create({ email: 'a@a.com', password: '123456' })
  userToken = signSync(user.id)
  activity = await Activity.create({ 
    user: user.id, 
    author: user.id, 
    text: 'text' 
  })
  feedNews = await FeedNews.create({ 
    user: user.id, 
    activity: activity.id, 
    relevance: 1 
  })
})

test('POST /feed 201', async () => {
  const { status, body } = await request(app())
    .post(`${apiRoot}`)
    .set('Authorization', `Bearer ${userToken}`)
    .send({ 
      text: 'test'
    })
  expect(status).toBe(201)
  expect(typeof body).toEqual('object')
  expect(body.user).toBe(user.id)
})

test('POST /feed 401', async () => {
  const { status } = await request(app())
    .post(`${apiRoot}`)
  expect(status).toBe(401)
})

test('GET /feed 200', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}`)
    .set('Authorization', `Bearer ${userToken}`)
  expect(status).toBe(200)
  expect(Array.isArray(body.rows)).toBe(true)
  expect(Number.isNaN(body.count)).toBe(false)
})

test('GET /feed 401', async () => {
  const { status } = await request(app())
    .get(`${apiRoot}`)
  expect(status).toBe(401)
})

test('GET /feed/:id 200', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}/${feedNews.id}`)
    .set('Authorization', `Bearer ${userToken}`)
  expect(status).toBe(200)
  expect(typeof body).toEqual('object')
  expect(body.id).toEqual(feedNews.id)
})

test('GET /feed/:id 401', async () => {
  const { status } = await request(app())
    .get(`${apiRoot}/${feedNews.id}`)
  expect(status).toBe(401)
})

test('GET /feed/:id 404 (user)', async () => {
  const { status } = await request(app())
    .get(apiRoot + '/123456789098765432123456')
    .set('Authorization', `Bearer ${userToken}`)
  expect(status).toBe(404)
})

test('DELETE /feed/:id 204 (user)', async () => {
  const { status } = await request(app())
    .delete(`${apiRoot}/${feedNews.id}`)
    .set('Authorization', `Bearer ${userToken}`)
  expect(status).toBe(204)
})

test('DELETE /feed/:id 401', async () => {
  const { status } = await request(app())
    .delete(`${apiRoot}/${feedNews.id}`)
  expect(status).toBe(401)
})

test('DELETE /feed/:id 404 (user)', async () => {
  const { status } = await request(app())
    .delete(apiRoot + '/123456789098765432123456')
    .set('Authorization', `Bearer ${userToken}`)
  expect(status).toBe(404)
})
