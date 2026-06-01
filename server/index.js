const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')

// Load environment variables
dotenv.config()

// Create express app
const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'ProjectPulse API is running 🚀' })
})

// Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})