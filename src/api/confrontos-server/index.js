import { Router } from 'express'
import { middleware as query } from 'querymen'
import { create, index, show, update, destroy } from './controller'
export ConfrontosServer, { schema } from './model'

const router = new Router()

/**
 * @api {post} /confrontos-servers Create confrontos server
 * @apiName CreateConfrontosServer
 * @apiGroup ConfrontosServer
 * @apiSuccess {Object} confrontosServer Confrontos server's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Confrontos server not found.
 */
router.post('/',
  create)

/**
 * @api {get} /confrontos-servers Retrieve confrontos servers
 * @apiName RetrieveConfrontosServers
 * @apiGroup ConfrontosServer
 * @apiUse listParams
 * @apiSuccess {Object[]} confrontosServers List of confrontos servers.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 */
router.get('/',
  query(),
  index)

/**
 * @api {get} /confrontos-servers/:id Retrieve confrontos server
 * @apiName RetrieveConfrontosServer
 * @apiGroup ConfrontosServer
 * @apiSuccess {Object} confrontosServer Confrontos server's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Confrontos server not found.
 */
router.get('/:id',
  show)

/**
 * @api {put} /confrontos-servers/:id Update confrontos server
 * @apiName UpdateConfrontosServer
 * @apiGroup ConfrontosServer
 * @apiSuccess {Object} confrontosServer Confrontos server's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Confrontos server not found.
 */
router.put('/:id',
  update)

/**
 * @api {delete} /confrontos-servers/:id Delete confrontos server
 * @apiName DeleteConfrontosServer
 * @apiGroup ConfrontosServer
 * @apiSuccess (Success 204) 204 No Content.
 * @apiError 404 Confrontos server not found.
 */
router.delete('/:id',
  destroy)

export default router
