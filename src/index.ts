import express, { Response, NextFunction, Request } from 'express'
import usersRouter from '~/routes/users.routes'
import databaseService from './services/database.services'
import { defaulErrorHandler } from './middlewares/errors.middlewares'
databaseService.connect()
const app = express()
const port = 3002
app.use(express.json())
app.use('/users', usersRouter)

app.use(defaulErrorHandler)

app.listen(port, () => {
  console.log(`port${port}`)
})
