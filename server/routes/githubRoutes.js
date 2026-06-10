const express = require('express')
const router = express.Router()
const { connectRepo, getGithubData } = require('../controllers/githubController')
const { protect } = require('../middleware/authMiddleware')

router.use(protect)

router.post('/connect', connectRepo)
router.get('/:projectId', getGithubData)

module.exports = router
