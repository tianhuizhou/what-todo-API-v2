import 'express-async-errors'
import { Request, Response } from 'express'
require('dotenv').config()

const express = require('express')
const cors = require('cors')
const port = process.env.PORT || 3000
const app = express()

const admin = require('firebase-admin')

const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIAL || '')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
})

app.use(cors())

app.use(express.json())

// An open API that Only for AWS ELB health check
// otherwise, ELB health check will always fail since endpoints are required Authentication
// Health Check
app.get('/api/__healthcheck', (_: Request, response: Response) => response.status(200).end(''))

// Auth middleware by Google Firebase Authentication
const auth_middleware = require('./middleware/auth_firebase')

// Routes
const users_router = require('./resetful-api/route/users')
const projects_router = require('./resetful-api/route/projects')
const board_router = require('./resetful-api/route/boards')
const task_router = require('./resetful-api/route/tasks')
const tag_router = require('./resetful-api/route/tags')

app.use('/api/users', auth_middleware, users_router)
app.use('/api/projects', auth_middleware, projects_router)
app.use('/api/boards', auth_middleware, board_router)
app.use('/api/tasks', auth_middleware, task_router)
app.use('/api/tags', auth_middleware, tag_router)

// Error handler middleware
const error_handler = require('./middleware/error_handler')
app.use(error_handler)

app.listen(port, () => {
  console.log(`What-todo app listening on port ${port}`)
})
