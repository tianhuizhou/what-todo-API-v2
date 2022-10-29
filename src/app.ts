import 'express-async-errors'
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

// Middleware
const auth_middleware = require('./middleware/auth_firebase')
if (process.env.NODE_ENV == 'production') app.use(auth_middleware)

// Routes
const users_router = require('./resetful-api/route/users')
const projects_router = require('./resetful-api/route/projects')
const board_router = require('./resetful-api/route/boards')
const task_router = require('./resetful-api/route/tasks')
const tag_router = require('./resetful-api/route/tags')

app.use('/users', users_router)
app.use('/projects', projects_router)
app.use('/boards', board_router)
app.use('/tasks', task_router)
app.use('/tags', tag_router)

// Error handler middleware
const error_handler = require('./middleware/error_handler')
app.use(error_handler)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
