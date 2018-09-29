import { Router } from 'express'
import { middleware as query } from 'querymen'
import { middleware as body } from 'bodymen'
import { token } from '../../services/passport'
import { create, index, show, destroy } from './controller'
import { schema } from './../activity'
export FeedNews, { schema } from './model'

const router = new Router()
const { text } = schema.tree

/**
 * @api {post} /feed Create feed news
 * @apiName CreateFeedNews
 * @apiGroup FeedNews
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiParam text Feed news's text.
 * @apiSuccess {Object} feedNews Feed news's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Feed news not found.
 * @apiError 401 user access only.
 */
router.post('/',
  token({ required: true }),
  body({ text }),
  create)

/**
 * @api {get} /feed Retrieve feed news
 * @apiName RetrieveFeedNews
 * @apiGroup FeedNews
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiUse listParams
 * @apiSuccess {Number} count Total amount of feed news.
 * @apiSuccess {Object[]} rows List of feed news.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 401 user access only.
 */
router.get('/',
  token({ required: true }),
  query(),
  index)

/**
 * @api {get} /feed/:id Retrieve feed news
 * @apiName RetrieveFeedNews
 * @apiGroup FeedNews
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiSuccess {Object} feedNews Feed news's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Feed news not found.
 * @apiError 401 user access only.
 */
router.get('/:id',
  token({ required: true }),
  show)

/**
 * @api {delete} /feed/:id Delete feed news
 * @apiName DeleteFeedNews
 * @apiGroup FeedNews
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiSuccess (Success 204) 204 No Content.
 * @apiError 404 Feed news not found.
 * @apiError 401 user access only.
 */
router.delete('/:id',
  token({ required: true }),
  destroy)

export default router
