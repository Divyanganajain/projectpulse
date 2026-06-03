const Project = require('../models/Project')
const Team = require('../models/Team')

// @desc    Create a project
// @route   POST /api/projects
// @access  Protected
const createProject = async (req, res) => {
  try {
    const { name, description, teamId, deadline, techStack } = req.body

    if (!name || !teamId) {
      return res.status(400).json({ success: false, message: 'Name and team are required' })
    }

    // Check if user is member of the team
    const team = await Team.findById(teamId)
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' })
    }

    const isMember = team.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    )
    if (!isMember) {
      return res.status(403).json({ success: false, message: 'Not a team member' })
    }

    const project = await Project.create({
      name,
      description,
      team: teamId,
      members: team.members.map((m) => m.user),
      deadline,
      techStack: techStack || [],
    })

    res.status(201).json({ success: true, project })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Get all projects for a team
// @route   GET /api/projects/team/:teamId
// @access  Protected
const getTeamProjects = async (req, res) => {
  try {
    const projects = await Project.find({ team: req.params.teamId })
      .populate('members', 'name email profilePicture')

    res.status(200).json({ success: true, projects })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Protected
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('members', 'name email profilePicture')
      .populate('team', 'name')

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' })
    }

    res.status(200).json({ success: true, project })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Protected
const updateProject = async (req, res) => {
  try {
    const { name, description, status, deadline, techStack, githubRepo } = req.body

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { name, description, status, deadline, techStack, githubRepo },
      { new: true, runValidators: true }
    )

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' })
    }

    res.status(200).json({ success: true, project })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

module.exports = { createProject, getTeamProjects, getProject, updateProject }
