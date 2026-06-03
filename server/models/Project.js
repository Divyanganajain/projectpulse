const mongoose = require('mongoose')

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    status: {
      type: String,
      enum: ['Planning', 'In Progress', 'Completed', 'Archived'],
      default: 'Planning',
    },
    deadline: {
      type: Date,
    },
    techStack: [
      {
        type: String,
        trim: true,
      },
    ],
    githubRepo: {
      type: String,
      default: '',
    },
    healthScore: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
)

const Project = mongoose.model('Project', projectSchema)
module.exports = Project
