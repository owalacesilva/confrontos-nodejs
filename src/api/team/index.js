import { Router } from 'express'
import { middleware as query } from 'querymen'
import { middleware as body } from 'bodymen'
import { token } from '../../services/passport'
import { create, index, show, update } from './controller'
import { schema } from './model'
export Team, { schema } from './model'

const router = new Router()
const { display_name, sport, address, schedule, phones } = schema.tree

/**
 * @api {post} /teams Create team
 * @apiName CreateTeam
 * @apiGroup Team
 * @apiParam display_name Team's display_name.
 * @apiParam sport Team's sport.
 * @apiParam user Team's user.
 * @apiSuccess {Object} team Team's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Team not found.
 */
router.post('/',
  token({ required: true }),
  body({ display_name, sport, address, schedule, phones }),
  create)

/**
 * @api {get} /teams Retrieve teams
 * @apiName RetrieveTeams
 * @apiGroup Team
 * @apiUse listParams
 * @apiSuccess {Number} count Total amount of teams.
 * @apiSuccess {Object[]} rows List of teams.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 */
router.get('/',
  query(),
  index)

/**
 * @api {get} /teams/:id Retrieve team
 * @apiName RetrieveTeam
 * @apiGroup Team
 * @apiSuccess {Object} team Team's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Team not found.
 */
router.get('/:id',
  show)

/**
 * @api {put} /teams/:id Update team
 * @apiName UpdateTeam
 * @apiGroup Team
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiParam display_name Team's display_name.
 * @apiSuccess {Object} team Team's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Team not found.
 * @apiError 401 user access only.
 */
router.put('/:id',
  token({ required: true }),
  body({ display_name }),
  update)

export default router
