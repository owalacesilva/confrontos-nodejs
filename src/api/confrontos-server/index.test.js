import request from 'supertest'
import { apiRoot } from '../../config'
import express from '../../services/express'
import routes, { ConfrontosServer } from '.'

const app = () => express(apiRoot, routes)

let confrontosServer

beforeEach(async () => {
  confrontosServer = await ConfrontosServer.create({})
})

test('POST /confrontos-servers 201', async () => {
  const { status, body } = await request(app())
    .post(`${apiRoot}`)
  expect(status).toBe(201)
  expect(typeof body).toEqual('object')
})

test('GET /confrontos-servers 200', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}`)
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
})

test('GET /confrontos-servers/:id 200', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}/${confrontosServer.id}`)
  expect(status).toBe(200)
  expect(typeof body).toEqual('object')
  expect(body.id).toEqual(confrontosServer.id)
})

test('GET /confrontos-servers/:id 404', async () => {
  const { status } = await request(app())
    .get(apiRoot + '/123456789098765432123456')
  expect(status).toBe(404)
})

test('PUT /confrontos-servers/:id 200', async () => {
  const { status, body } = await request(app())
    .put(`${apiRoot}/${confrontosServer.id}`)
  expect(status).toBe(200)
  expect(typeof body).toEqual('object')
  expect(body.id).toEqual(confrontosServer.id)
})

test('PUT /confrontos-servers/:id 404', async () => {
  const { status } = await request(app())
    .put(apiRoot + '/123456789098765432123456')
  expect(status).toBe(404)
})

test('DELETE /confrontos-servers/:id 204', async () => {
  const { status } = await request(app())
    .delete(`${apiRoot}/${confrontosServer.id}`)
  expect(status).toBe(204)
})

test('DELETE /confrontos-servers/:id 404', async () => {
  const { status } = await request(app())
    .delete(apiRoot + '/123456789098765432123456')
  expect(status).toBe(404)
})
