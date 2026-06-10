const Project = require('../models/Project')
const Activity = require('../models/Activity')
const {
  getRepoInfo,
  getCommits,
  getIssues,
  getPullRequests,
  getContributors,
} = require('../services/githubService')

// @desc    Connect GitHub repo to project
// @route   POST /api/github/connect
// @access  Protected
const connectRepo = async (req, res) => {
  try {
    const { projectId, repoUrl } = req.body

    if (!projectId || !repoUrl) {
      return res.status(400).json({ success: false, message: 'Project ID and repo URL required' })
    }

    // Extract owner and repo from URL
    // https://github.com/owner/repo → ['owner', 'repo']
    const urlParts = repoUrl.replace('https://github.com/', '').split('/')
    const owner = urlParts[0]
    const repo = urlParts[1]

    if (!owner || !repo) {
      return res.status(400).json({ success: false, message: 'Invalid GitHub URL' })
    }

    // Verify repo exists on GitHub
    const repoInfo = await getRepoInfo(owner, repo)

    // Save repo URL to project
    const project = await Project.findByIdAndUpdate(
      projectId,
      { githubRepo: repoUrl },
      { new: true }
    )

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' })
    }

    // Log activity
    await Activity.create({
      project: projectId,
      user: req.user._id,
      action: `connected GitHub repo: ${repoInfo.full_name}`,
      entityType: 'github',
    })

    res.status(200).json({
      success: true,
      message: 'Repository connected successfully',
      repo: {
        name: repoInfo.name,
        fullName: repoInfo.full_name,
        description: repoInfo.description,
        stars: repoInfo.stargazers_count,
        language: repoInfo.language,
      },
    })
  } catch (error) {
    console.log('GitHub Error:', error.response?.data || error.message)
    if (error.response?.status === 404) {
      return res.status(404).json({ success: false, message: 'GitHub repo not found' })
    }
    res.status(500).json({ success: false, message: error.response?.data?.message || error.message })
  }
}

// @desc    Get GitHub data for a project
// @route   GET /api/github/:projectId
// @access  Protected
const getGithubData = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId)

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' })
    }

    if (!project.githubRepo) {
      return res.status(400).json({ success: false, message: 'No GitHub repo connected' })
    }

    // Extract owner and repo from saved URL
    const urlParts = project.githubRepo.replace('https://github.com/', '').split('/')
    const owner = urlParts[0]
    const repo = urlParts[1]

    // Fetch all data in parallel — much faster than sequential
    const [commits, issues, pullRequests, contributors] = await Promise.all([
      getCommits(owner, repo),
      getIssues(owner, repo),
      getPullRequests(owner, repo),
      getContributors(owner, repo),
    ])

    // Most active contributor
    const topContributor = contributors[0] || null

    // Last commit info
    const lastCommit = commits[0] || null

    res.status(200).json({
      success: true,
      github: {
        commits,
        issues,
        pullRequests,
        contributors,
        summary: {
          totalCommits: commits.length,
          openIssues: issues.length,
          openPRs: pullRequests.length,
          topContributor,
          lastCommit,
        },
      },
    })
  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({ success: false, message: 'GitHub repo not found' })
    }
    res.status(500).json({ success: false, message: error.message })
  }
}

module.exports = { connectRepo, getGithubData }
