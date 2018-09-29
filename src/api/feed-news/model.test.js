import { FeedNews } from '.'
import { User } from '../user'
import Activity from '../activity'

let feedNews, user, activity

beforeEach(async () => {
  user = await User.create({ 
    email: 'a@a.com', 
    password: '123456' 
  })
  activity = await Activity.create({ 
    user: user.id, 
    author: user.id, 
    text: 'text' 
  })
  feedNews = await FeedNews.create({ 
    user: user.id, 
    activity: activity.id, 
    relevance: 1 
  })
})

describe('view', () => {
  it('returns full view', () => {
    const view = feedNews.view(true)
    expect(typeof view).toBe('object')
    expect(String(view.id)).toBe(feedNews.id)
    expect(String(view.user)).toBe(user.id)
    expect(String(view.activity)).toBe(activity.id)
    expect(view.relevance).toBe(feedNews.relevance)
    expect(view.created_at).toBeTruthy()
    expect(view.updated_at).toBeTruthy()
  })
})
