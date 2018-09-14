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
