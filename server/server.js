// server.js

const express = require('express')
const methodOverride = require('method-override')
const compression = require('compression')
const cors = require('cors')
const path = require('path')
const { sequelize } = require('./models')
const ApiRouter = require('./routes/Api')

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(compression())
app.use(cors())
app.use(methodOverride())
app.use(express.urlencoded({extended: false})) // Modern Express body parsing
app.use(express.json()) // Modern Express JSON parsing

// Routes
app.use("/", express.static(path.join(__dirname, 'public')))
app.use('/api', ApiRouter)

// Serve client app
app.use(express.static('../client/dist'))

app.get('*', (req, res) => {
	res.sendFile(path.resolve(__dirname, '..', 'client', 'dist', 'index.html'))
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
