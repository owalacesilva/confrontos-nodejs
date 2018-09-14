import { Router } from 'express'
import { middleware as query } from 'querymen'
import { index, show } from './controller'
export Match, { schema } from './model'

const router = new Router()

/**
 * @api {get} /matches Retrieve matches
 * @apiName RetrieveMatches
 * @apiGroup Match
 * @apiUse listParams
 * @apiSuccess {Number} count Total amount of matches.
 * @apiSuccess {Object[]} rows List of matches.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 */
router.get('/',
  query(),
  index)

/**
 * @api {get} /matches/:id Retrieve match
 * @apiName RetrieveMatch
 * @apiGroup Match
 * @apiSuccess {Object} match Match's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Match not found.
 */
router.get('/:id',
  show)

export default router
