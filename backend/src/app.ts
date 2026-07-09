import express, { json } from 'express'
import morgan from 'morgan'
import cors from 'cors'
import fileUpload from 'express-fileupload'
import config from 'config'
import logError from './middlewares/error/log-error'
import respondError from './middlewares/error/error-responder'
import notFound from './middlewares/not-found'
import authRouter from './routers/auth'
import vacationsRouter from './routers/vacations'
import reportsRouter from './routers/reports'
import itineraryRouter from './routers/itinerary'
import authEnforce from './middlewares/auth-enforce'
import sequelize from './db/sequelize'
import { createAppBucketIfNotExist, uploadSeedImagesIfMissing } from './aws/aws'

const app = express()

app.use(morgan('dev'))

// middlewares
app.use('/', cors())
app.use('/auth', authRouter)
app.use('/', authEnforce)
app.use('/', json())
app.use('/', fileUpload()) // handles multipart/form-data requests (vacation images)
app.use('/vacations', vacationsRouter)
app.use('/reports', reportsRouter)
app.use('/itinerary', itineraryRouter)

// not found
app.use('/', notFound)

// error middlewares
app.use('/', logError)
app.use('/', respondError)

export default app

export async function init() {
    // start our sequelize engine: connect to the database,
    // check the models array against it and create missing tables
    // using {force: true} is SUPER dangerous, especially in production!
    await sequelize.sync({ force: !!config.get('app.sync.force') })

    // make sure the s3 bucket for vacation images exists
    // and holds the seed images referenced by the seed sql
    await createAppBucketIfNotExist()
    await uploadSeedImagesIfMissing()
}