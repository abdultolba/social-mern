// server.js (ESM)
import express from 'express'
import methodOverride from 'method-override'
import compression from 'compression'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname, join, resolve } from 'path'
import { sequelize } from './models/index.js'
import ApiRouter from './routes/Api.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(compression())
app.use(cors())
app.use(methodOverride())
app.use(express.urlencoded({extended: false})) // Modern Express body parsing
app.use(express.json()) // Modern Express JSON parsing

// Routes
app.use('/', express.static(join(__dirname, 'public')))
app.use('/api', ApiRouter)

// Serve client app (optional if serving SPA from same service)
app.use(express.static(resolve(__dirname, '..', 'client', 'dist')))

app.get('*', (req, res) => {
  res.sendFile(resolve(__dirname, '..', 'client', 'dist', 'index.html'))
})

// Initialize database and start server
const startServer = async () => {
  try {
    // Sync database (create tables)
    await sequelize.sync({ force: false }) // Set to true to recreate tables
    console.log('✅ Database synced successfully')

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
