const express = require('express')
const router = express.Router()
const { createProject, getTeamProjects, getProject, updateProject } = require('../controllers/projectController')
const { protect } = require('../middleware/authMiddleware')

router.use(protect)

router.post('/', createProject)
router.get('/team/:teamId', getTeamProjects)
router.get('/:id', getProject)
router.put('/:id', updateProject)

module.exports = router
