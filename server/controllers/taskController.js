const Task = require('../models/Task')
const Activity = require('../models/Activity')
const Project = require('../models/Project')

// Helper — create activity log entry
const logActivity = async (projectId, userId, action, entityType, entityId, metadata = {}) => {
  try {
    await Activity.create({
      project: projectId,
      user: userId,
      action,
      entityType,
      entityId,
      metadata,
    })
  } catch (error) {
    console.error('Activity log error:', error.message)
  }
}

// @desc    Create task
// @route   POST /api/tasks
// @access  Protected
const createTask = async (req, res) => {
  try {
    const { title, description, projectId, assignedTo, priority, dueDate } = req.body

    if (!title || !projectId) {
      return res.status(400).json({ success: false, message: 'Title and project are required' })
    }

    const project = await Project.findById(projectId)
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' })
    }

    const task = await Task.create({
      title,
      description,
      project: projectId,
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
      priority: priority || 'Medium',
      dueDate: dueDate || null,
    })

    // Log activity automatically
    await logActivity(
      projectId,
      req.user._id,
      `created task: ${title}`,
      'task',
      task._id
    )

    res.status(201).json({ success: true, task })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Get all tasks for a project
// @route   GET /api/tasks/project/:projectId
// @access  Protected
const getProjectTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignedTo', 'name email profilePicture')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })

    // Check overdue
    const now = new Date()
    const updatedTasks = tasks.map((task) => {
      const taskObj = task.toObject()
      if (task.dueDate && task.dueDate < now && task.status !== 'Done') {
        taskObj.isOverdue = true
      }
      return taskObj
    })

    res.status(200).json({ success: true, tasks: updatedTasks })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Protected
const updateTask = async (req, res) => {
  try {
    const { title, description, status, priority, assignedTo, dueDate } = req.body

    const task = await Task.findById(req.params.id)
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' })
    }

    const oldStatus = task.status

    task.title = title || task.title
    task.description = description || task.description
    task.status = status || task.status
    task.priority = priority || task.priority
    task.assignedTo = assignedTo || task.assignedTo
    task.dueDate = dueDate || task.dueDate

    await task.save()

    // Log status change activity
    if (status && status !== oldStatus) {
      const action = status === 'Done'
        ? `completed task: ${task.title}`
        : `updated task: ${task.title} to ${status}`

      await logActivity(
        task.project,
        req.user._id,
        action,
        'task',
        task._id,
        { oldStatus, newStatus: status }
      )
    }

    res.status(200).json({ success: true, task })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Protected
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' })
    }

    await logActivity(
      task.project,
      req.user._id,
      `deleted task: ${task.title}`,
      'task',
      task._id
    )

    await task.deleteOne()

    res.status(200).json({ success: true, message: 'Task deleted' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
// @access  Protected
const addComment = async (req, res) => {
  try {
    const { text } = req.body
    if (!text) {
      return res.status(400).json({ success: false, message: 'Comment text is required' })
    }

    const task = await Task.findById(req.params.id)
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' })
    }

    task.comments.push({ user: req.user._id, text })
    await task.save()

    await logActivity(
      task.project,
      req.user._id,
      `commented on task: ${task.title}`,
      'comment',
      task._id
    )

    res.status(201).json({ success: true, task })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Get activity feed for a project
// @route   GET /api/tasks/activity/:projectId
// @access  Protected
const getActivityFeed = async (req, res) => {
  try {
    const activities = await Activity.find({ project: req.params.projectId })
      .populate('user', 'name email profilePicture')
      .sort({ createdAt: -1 })
      .limit(50)

    res.status(200).json({ success: true, activities })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

module.exports = { createTask, getProjectTasks, updateTask, deleteTask, addComment, getActivityFeed }
