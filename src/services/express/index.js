import express, { Router } from 'express'
import cors from 'cors'
import path from 'path'
import compression from 'compression'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import winston from 'winston'
import api from './../../api'
import website from './../../app-web'
import { errorHandler as queryErrorHandler } from 'querymen'
import { errorHandler as bodyErrorHandler } from 'bodymen'
import { env, root, webRoot, apiRoot } from '../../config'

export default () => {
  const app = express()

  /* istanbul ignore next */
  if (env === 'production' || env === 'development') {
    app.use(cors())
    app.use(compression())
    app.use(morgan('dev'))
  }

  const filename = path.join(root, `log/api-${env}.log`);

  const logger = new winston.Logger({
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename })
    ]
  })

  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json({ limit: '50MB' }))
  app.use(express.static('public'))

  // Define routes wrappers
  app.use(webRoot, website)
  app.use(apiRoot, api)

  app.use((err, req, res, next) => {
    logger.error(err)
    next(err)
  })
  app.use(queryErrorHandler())
  app.use(bodyErrorHandler())

  return app
}
