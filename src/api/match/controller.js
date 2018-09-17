import _ from 'lodash'
import { success, notFound } from '../../services/response/'
import { Match } from '.'
import { Notification } from './../notification'

export const index = ({ querymen: { query, select, cursor } }, res, next) =>
  Match.count(query)
    .then(count => Match.find(query, select, cursor)
      .populate([{ 
        path: 'home_team', 
        select: 'user display_name abbr slug pictures', 
        populate: [{ 
          path: 'user', 
          select: 'display_name' 
        }] 
      }, { 
        path: 'visiting_team', 
        select: 'user display_name abbr slug pictures',
        populate: [{ 
          path: 'user', 
          select: 'display_name'
        }] 
      }])
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
  Match.findOne({ 
      '_id': params.id, 
      status: {
        $in: ['pending', 'in_progress']
      }
    }).populate([
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
      if (!revision && match.revisions.length > 0) {
        match.revisions.push({ user: user.id, stats })
        match.status = "finished"
        _.extend(match.stats, stats)
        _.forEach([match.home_team.user.toString(), match.visiting_team.user.toString()], (id) => {
          Notification.notify('close_match', match, { 
            match_id: match._id, 
            recipient: id
          })
        })
      } else if (revision) {
        _.extend(revision, { user: user.id, stats })
        match.markModified('revisions')
      } else {
        match.revisions.push({ user: user.id, stats })

        if ([
          match.home_team.user.toString(), 
          match.visiting_team.user.toString()
        ].filter((f) => f === user.id ? true : false).length > 1) {
          match.status = "finished"
          _.extend(match.stats, stats)
          _.forEach([match.home_team.user.toString(), match.visiting_team.user.toString()], (id) => {
            Notification.notify('close_match', match, { 
              match_id: match._id, 
              recipient: id
            })
          })
        }
      }

      return match.save()
    })
    .then((match) => match ? match.view(true) : null)
    .then(success(res, 201))
    .catch(next)
