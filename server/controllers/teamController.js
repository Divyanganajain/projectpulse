const Team = require('../models/Team')
const crypto = require('crypto')

// Generate random invite code
const generateInviteCode = () => {
  return crypto.randomBytes(6).toString('hex')
}

// @desc    Create a team
// @route   POST /api/teams
// @access  Protected
const createTeam = async (req, res) => {
  try {
    const { name, description } = req.body

    if (!name) {
      return res.status(400).json({ success: false, message: 'Team name is required' })
    }

    const team = await Team.create({
      name,
      description,
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'owner' }],
      inviteCode: generateInviteCode(),
    })

    res.status(201).json({ success: true, team })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Get all teams for logged in user
// @route   GET /api/teams
// @access  Protected
const getMyTeams = async (req, res) => {
  try {
    const teams = await Team.find({
      'members.user': req.user._id,
    }).populate('owner', 'name email')

    res.status(200).json({ success: true, teams })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Get single team
// @route   GET /api/teams/:id
// @access  Protected
const getTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email profilePicture')

    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' })
    }

    res.status(200).json({ success: true, team })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Join team via invite code
// @route   POST /api/teams/join
// @access  Protected
const joinTeam = async (req, res) => {
  try {
    const { inviteCode } = req.body

    const team = await Team.findOne({ inviteCode })

    if (!team) {
      return res.status(404).json({ success: false, message: 'Invalid invite code' })
    }

    // Check if already a member
    const isMember = team.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    )

    if (isMember) {
      return res.status(400).json({ success: false, message: 'Already a member' })
    }

    team.members.push({ user: req.user._id, role: 'member' })
    await team.save()

    res.status(200).json({ success: true, team })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

module.exports = { createTeam, getMyTeams, getTeam, joinTeam }
