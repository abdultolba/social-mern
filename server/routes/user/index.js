import express from 'express'

import SettingsRouter from './settings.js'
import NewRouter from './new.js'
import BasicsRouter from './basics.js'

const UserRouter = express.Router()

UserRouter.use('/settings', SettingsRouter)
UserRouter.use('/new', NewRouter)
UserRouter.use('/', BasicsRouter)

export default UserRouter
