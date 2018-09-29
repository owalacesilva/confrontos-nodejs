import { success, notFound } from '../../services/response/'
import { FeedNews } from '.'
import { User } from './../user'
import Activity from './../activity'

export const create = ({ bodymen: { body }, user }, res, next) =>
  Activity.create({ ...body, user: user._id, author: user._id })
    .then(async (activity) => {
      const userIds = await User.distinct('_id')
      for (let i = 0; i < userIds.length; i++) {
        const _id = userIds[i]
        await FeedNews.create({ user: _id, activity: activity._id, relevance: 1 })
      }
      return activity
    })
    .then(success(res, 201))
    .catch(next)

export const index = ({ querymen: { query, select, cursor }, user }, res, next) =>
  FeedNews.count({ ...query, user: user._id })
    .then(count => FeedNews.find({ ...query, user: user._id }, select, cursor)
      .populate([{ 
        path: 'activity', 
        select: 'user status text likes author entities', 
        populate: [{
          path: 'user', 
          select: 'display_name picture' 
        },{
          path: 'author', 
          select: 'display_name picture' 
        }]
      }])
      .then((feedNews) => ({
        count,
        rows: feedNews.map((feedNews) => feedNews.view())
      }))
    )
    .then(success(res))
    .catch(next)

export const show = ({ params, user }, res, next) =>
  FeedNews.findById({ '_id': params.id, user: user._id })
    .then(notFound(res))
    .then((feedNews) => feedNews ? feedNews.view() : null)
    .then(success(res))
    .catch(next)

export const destroy = ({ params, user }, res, next) =>
  FeedNews.findById({ '_id': params.id, user: user._id })
    .then(notFound(res))
    .then((feedNews) => feedNews ? feedNews.remove() : null)
    .then(success(res, 204))
    .catch(next)
