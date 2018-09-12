import { success, notFound } from '../../services/response/'
import { ConfrontosServer } from '.'

export const create = ({ body }, res, next) =>
  ConfrontosServer.create(body)
    .then((confrontosServer) => confrontosServer.view(true))
    .then(success(res, 201))
    .catch(next)

export const index = ({ querymen: { query, select, cursor } }, res, next) =>
  ConfrontosServer.find(query, select, cursor)
    .then((confrontosServers) => confrontosServers.map((confrontosServer) => confrontosServer.view()))
    .then(success(res))
    .catch(next)

export const show = ({ params }, res, next) =>
  ConfrontosServer.findById(params.id)
    .then(notFound(res))
    .then((confrontosServer) => confrontosServer ? confrontosServer.view() : null)
    .then(success(res))
    .catch(next)

export const update = ({ body, params }, res, next) =>
  ConfrontosServer.findById(params.id)
    .then(notFound(res))
    .then((confrontosServer) => confrontosServer ? Object.assign(confrontosServer, body).save() : null)
    .then((confrontosServer) => confrontosServer ? confrontosServer.view(true) : null)
    .then(success(res))
    .catch(next)

export const destroy = ({ params }, res, next) =>
  ConfrontosServer.findById(params.id)
    .then(notFound(res))
    .then((confrontosServer) => confrontosServer ? confrontosServer.remove() : null)
    .then(success(res, 204))
    .catch(next)
