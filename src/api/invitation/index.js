import { Router } from 'express'
import { middleware as query } from 'querymen'
import { middleware as body } from 'bodymen'
import { token } from '../../services/passport'
import { create, index, show, update, destroy } from './controller'
import { schema } from './model'
export Invitation, { schema } from './model'

const router = new Router()
const { guest_user, team, guest_team, date, start_at, status } = schema.tree

/**
 * @api {post} /invitations Create invitation
 * @apiName CreateInvitation
 * @apiGroup Invitation
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiParam date Invitation's date.
 * @apiParam start_at Invitation's start_at.
 * @apiSuccess {Object} invitation Invitation's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Invitation not found.
 * @apiError 401 user access only.
 */
router.post('/',
  token({ required: true }),
  body({ guest_user, team, guest_team, date, start_at }),
  create)

/**
 * @api {get} /invitations Retrieve invitations
 * @apiName RetrieveInvitations
 * @apiGroup Invitation
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiUse listParams
 * @apiSuccess {Number} count Total amount of invitations.
 * @apiSuccess {Object[]} rows List of invitations.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 401 user access only.
 */
router.get('/',
  token({ required: true }),
  query(),
  index)

/**
 * @api {get} /invitations/:id Retrieve invitation
 * @apiName RetrieveInvitation
 * @apiGroup Invitation
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiSuccess {Object} invitation Invitation's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Invitation not found.
 * @apiError 401 user access only.
 */
router.get('/:id',
  token({ required: true }),
  show)

/**
 * @api {put} /invitations/:id Update invitation
 * @apiName UpdateInvitation
 * @apiGroup Invitation
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiParam date Invitation's date.
 * @apiParam start_at Invitation's start_at.
 * @apiSuccess {Object} invitation Invitation's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Invitation not found.
 * @apiError 401 user access only.
 */
router.put('/:id',
  token({ required: true }),
  body({ 
    date: {
      type: Date
    }, 
    start_at: {
      type: Date
    }, 
    status: {
      type: String, 
      enum: ['pending', 'accepted', 'refused']
    }
  }),
  update)

/**
 * @api {delete} /invitations/:id Delete invitation
 * @apiName DeleteInvitation
 * @apiGroup Invitation
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiSuccess (Success 204) 204 No Content.
 * @apiError 404 Invitation not found.
 * @apiError 401 user access only.
 */
router.delete('/:id',
  token({ required: true }),
  destroy)

export default router
