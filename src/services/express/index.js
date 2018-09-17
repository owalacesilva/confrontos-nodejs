import express from 'express'
import cors from 'cors'
import path from 'path'
import compression from 'compression'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import winston from 'winston'
import { errorHandler as queryErrorHandler } from 'querymen'
import { errorHandler as bodyErrorHandler } from 'bodymen'
import { env, root } from '../../config'

export default (apiRoot, routes) => {
  const app = express()

  /* istanbul ignore next */
  if (env === 'production' || env === 'development') {
    app.use(cors())
    app.use(compression())
    app.use(morgan('dev'))
  }

  const filename = path.join(root, `src/logs/api-${env}.log`);

  const logger = new winston.Logger({
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename })
    ]
  })

  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json({ limit: '50MB' }))
  app.use(apiRoot, routes)
  app.use((err, req, res, next) => {
    logger.error(err)
    next(err)
  })
  app.use(queryErrorHandler())
  app.use(bodyErrorHandler())

  return app
}
