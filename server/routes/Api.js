import express from 'express'

import AuthRouter from './Auth.js'
import UserRouter from './user/index.js'
import DiscoverRouter from './Discover.js'
import PostRouter from './Post.js'
import CommentRouter from './Comment.js'
import NotificationRouter from './Notification.js'

const apiRouter = express.Router()

apiRouter.use('/auth', AuthRouter)
apiRouter.use('/user', UserRouter)
apiRouter.use('/discover', DiscoverRouter)
apiRouter.use('/post', PostRouter)
apiRouter.use('/comment', CommentRouter)
apiRouter.use('/notifications', NotificationRouter)

export default apiRouter
