import request from 'request-promise'

export const getUser = (accessToken) =>
  request({
    uri: 'https://www.googleapis.com/userinfo/v2/me',
    json: true,
    qs: {
      access_token: accessToken
    }
  }).then(({ id, name, email, picture }) => ({
    provider: 'google',
    picture,
    id,
    name,
    email
  }))
