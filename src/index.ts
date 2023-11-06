import express,{Response,NextFunction, Request} from 'express'
import usersRouter from '~/routes/users.routes'
import databaseService from './services/database.services'
const app = express()
const port = 3002
app.use(express.json())
app.use('/users', usersRouter)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.log('lỗi là ', err.message);
  res.status(400).json({ error: err.message })
})
databaseService.connect()

app.listen(port, () => {
  console.log(`port${port}`)
})
