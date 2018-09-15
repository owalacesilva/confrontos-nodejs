import { Router } from 'express'
import { middleware as query } from 'querymen'
import { middleware as body } from 'bodymen'
import { token } from '../../services/passport'
import { index, show, createRevision } from './controller'
import { schema } from './model'
export Match, { schema } from './model'

const router = new Router()
const { stats } = schema.tree

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

/**
 * @api {post} /matches/:id/revision Create revision
 * @apiName CreateRevision
 * @apiGroup Match
 * @apiSuccess {Object} match Match's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Match not found.
 * @apiError 401 user access only.
 */
router.post('/:id/revision',
  token({ required: true }),
  body({ 
    stats: {
      type: {
        "name": String,
        "label": String,
        "home_team_score": Number,
        "visiting_team_score": Number
      },
      required: true
    } 
  }),
  createRevision)

export default router
