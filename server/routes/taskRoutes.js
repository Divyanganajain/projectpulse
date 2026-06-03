const express = require('express')
const router = express.Router()
const {
  createTask,
  getProjectTasks,
  updateTask,
  deleteTask,
  addComment,
  getActivityFeed
} = require('../controllers/taskController')
const { protect } = require('../middleware/authMiddleware')

router.use(protect)

router.post('/', createTask)
router.get('/project/:projectId', getProjectTasks)
router.get('/activity/:projectId', getActivityFeed)
router.put('/:id', updateTask)
router.delete('/:id', deleteTask)
router.post('/:id/comments', addComment)

module.exports = router
