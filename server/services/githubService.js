const axios = require('axios')

const getGithubAPI = () => {
  return axios.create({
    baseURL: 'https://api.github.com',
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
    },
  })
}

const getRepoInfo = async (owner, repo) => {
  const response = await getGithubAPI().get(`/repos/${owner}/${repo}`)
  return response.data
}

const getCommits = async (owner, repo) => {
  const response = await getGithubAPI().get(`/repos/${owner}/${repo}/commits`, {
    params: { per_page: 20 }
  })
  return response.data.map((commit) => ({
    sha: commit.sha.substring(0, 7),
    message: commit.commit.message,
    author: commit.commit.author.name,
    authorEmail: commit.commit.author.email,
    date: commit.commit.author.date,
    url: commit.html_url,
  }))
}

const getIssues = async (owner, repo) => {
  const response = await getGithubAPI().get(`/repos/${owner}/${repo}/issues`, {
    params: { state: 'open', per_page: 10 }
  })
  return response.data
    .filter((issue) => !issue.pull_request)
    .map((issue) => ({
      number: issue.number,
      title: issue.title,
      state: issue.state,
      createdAt: issue.created_at,
      url: issue.html_url,
      author: issue.user.login,
    }))
}

const getPullRequests = async (owner, repo) => {
  const response = await getGithubAPI().get(`/repos/${owner}/${repo}/pulls`, {
    params: { state: 'open', per_page: 10 }
  })
  return response.data.map((pr) => ({
    number: pr.number,
    title: pr.title,
    state: pr.state,
    createdAt: pr.created_at,
    url: pr.html_url,
    author: pr.user.login,
  }))
}

const getContributors = async (owner, repo) => {
  const response = await getGithubAPI().get(`/repos/${owner}/${repo}/contributors`, {
    params: { per_page: 10 }
  })
  return response.data.map((contributor) => ({
    username: contributor.login,
    contributions: contributor.contributions,
    avatar: contributor.avatar_url,
    url: contributor.html_url,
  }))
}

module.exports = { getRepoInfo, getCommits, getIssues, getPullRequests, getContributors }
