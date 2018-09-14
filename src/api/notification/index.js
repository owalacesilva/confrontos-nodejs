import { Router } from 'express'
import { middleware as query } from 'querymen'
import { token } from '../../services/passport'
import { index, show } from './controller'
export Notification, { schema } from './model'

const router = new Router()

/**
 * @api {get} /notifications Retrieve notifications
 * @apiName RetrieveNotifications
 * @apiGroup Notification
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiUse listParams
 * @apiSuccess {Number} count Total amount of notifications.
 * @apiSuccess {Object[]} rows List of notifications.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 401 user access only.
 */
router.get('/',
  token({ required: true }),
  query(),
  index)

/**
 * @api {get} /notifications/:id Retrieve notification
 * @apiName RetrieveNotification
 * @apiGroup Notification
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiSuccess {Object} notification Notification's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Notification not found.
 * @apiError 401 user access only.
 */
router.get('/:id',
  token({ required: true }),
  show)

export default router
