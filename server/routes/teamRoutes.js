const express = require('express')
const router = express.Router()
const { createTeam, getMyTeams, getTeam, joinTeam } = require('../controllers/teamController')
const { protect } = require('../middleware/authMiddleware')

router.use(protect)

router.post('/', createTeam)
router.get('/', getMyTeams)
router.get('/:id', getTeam)
router.post('/join', joinTeam)

module.exports = router
