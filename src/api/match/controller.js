import _ from 'lodash'
import { success, notFound } from '../../services/response/'
import { Match } from '.'

export const index = ({ querymen: { query, select, cursor } }, res, next) =>
  Match.count(query)
    .then(count => Match.find(query, select, cursor)
      .then((matches) => ({
        count,
        rows: matches.map((match) => match.view())
      }))
    )
    .then(success(res))
    .catch(next)

export const show = ({ params }, res, next) =>
  Match.findById(params.id)
    .then(notFound(res))
    .then((match) => match ? match.view() : null)
    .then(success(res))
    .catch(next)

export const createRevision = ({ bodymen: { body: { stats } }, user, params }, res, next) => 
  Match.findById(params.id)
    .populate([
      { path: 'home_team', select: 'user'},
      { path: 'visiting_team', select: 'user'}
    ])
    .then(notFound(res))
    .then((match) => {
      if (!match) return null
      if ([
        match.home_team.user.toString(), 
        match.visiting_team.user.toString()
      ].indexOf(user.id) > -1) {
        return match
      } else {
        res.status(401).end()
        return null
      }
    })
    .then((match) => {
      if (!match) return null
      const revision = _.find(match.revisions, { 'user': user._id })
      if (revision) {
        _.extend(revision, { user: user.id, stats })
        match.markModified('revisions')
      } else {
        match.revisions.push({ user: user.id, stats })
      }

      return match.save()
    })
    /*.then((match) => {
      if (!match) return null
      match.revisions.push({ user: user.id, stats })
      return match.save()
    })*/
    .then((match) => match ? match.view(true) : null)
    .then(success(res, 201))
    .catch(next)
