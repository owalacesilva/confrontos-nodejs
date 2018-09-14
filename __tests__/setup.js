import { EventEmitter } from 'events'
import MongodbMemoryServer from 'mongodb-memory-server'
import mongoose from '../src/services/mongoose'

EventEmitter.defaultMaxListeners = Infinity
// jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000

global.Array = Array
global.Date = Date
global.Function = Function
global.Math = Math
global.Number = Number
global.Object = Object
global.RegExp = RegExp
global.String = String
global.Uint8Array = Uint8Array
global.WeakMap = WeakMap
global.Set = Set
global.Error = Error
global.TypeError = TypeError
global.parseInt = parseInt
global.parseFloat = parseFloat

let mongod
const opts = { 
  config: {
    useMongoClient: true, 
    autoIndex: false 
  }
}

beforeAll(async () => {
  /*mongod = new MongodbMemoryServer({
    binary: {
      version: "3.4.14",
      debug: true
    }
  })
  const mongoUri = await mongod.getConnectionString()*/
  const mongoUri = "mongodb://localhost/confrontos-server-test"
  await mongoose.connect(mongoUri, opts, (err) => {
    if (err) console.error(err)
  })
})

afterAll(async () => {
  await mongoose.disconnect()
  // await mongod.stop()
})

afterEach(async () => {
  const { collections } = mongoose.connection
  const promises = []
  Object.keys(collections).forEach((collection) => {
    promises.push(collections[collection].remove())
  })
  await Promise.all(promises)
})
