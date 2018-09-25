import path from 'path'
import http from 'http'
import bodymen from 'bodymen'
import { env, mongo, port, ip, apiRoot } from './config'
import mongoose from './services/mongoose'
import express from './services/express'
import { success, notFound } from './services/response'
import api from './api'
import environment from './environment'
import mincer from 'mincer'
import { User, schema as UserSchema } from './api/user'

const { display_name, gender, email, password } = UserSchema.tree

const app = express(apiRoot, api)
const server = http.createServer(app)

// Set view engine
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// Attach assets server
app.use('/assets/', mincer.createServer(environment))

// Index page
app.get('/invite/:user_id', ({ params: { user_id } }, res, next) => 
  User.findOne({ user_id })
    .then(notFound(res))
    .then((user) => user ? user.view() : null)
    .then((user) => user ? res.render("pages/index", { user }) : null)
    .catch(next)
)

app.post('/invite/:user_id', bodymen.middleware({
  display_name,
  gender,
  email,
  password
}), ({ bodymen: { body }, params: { user_id }, xhr }, res, next) => {
  if (xhr) {
    return User.findOne({ user_id })
      .then(notFound(res))
      .then(user => user ? user.view(true) : null)
      .then(user => {
        if (user) {
          return User.create({ ...body, sponsor_id: user.id })
            .then(guest => guest ? guest.view() : null)
            .then(success(res))
            .catch(next)
        } else return null
      })
      .catch(next)
  } else {
    res.status(400).json({ error: 'Only xhr requests' })
  }
})

app.get('/congratulations', (req, res, next) => 
  res.render('pages/congratulations')
)

mongoose.connect(mongo.uri)
mongoose.Promise = Promise

setImmediate(() => {
  server.listen(port, ip, () => {
    console.log('Express server listening on http://%s:%d, in %s mode', ip, port, env)
  })
})

export default app
