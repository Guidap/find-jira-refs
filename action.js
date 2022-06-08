const _ = require('lodash')
const Octokit = require('@octokit/rest')

const JIRA_REF_REGEX = /([a-zA-Z0-9]+-[0-9]+)/g

const SOURCE_TEMPLATES = {
  branch: '{{context.ref}}',
  commits: "{{context.commits.map(c=>c.message).join(' ')}}",
}

module.exports = class {
  constructor ({ githubEvent, string, uniqueValues = true }) {
    this.githubEvent = githubEvent
    this.string = string
    this.uniqueValues = uniqueValues
  }

  async execute () {
    const foundIssues = []
    if (this.string) {
      const foundIssue = await this.findIssueKeyIn(this.string)
      if (foundIssue) foundIssues.push(...foundIssue)
    }

    const stringToSearch = [];
    // Search in branch/tag name
    if (this.githubEvent.ref && typeof this.githubEvent.ref === 'string') {
      stringToSearch.push(this.preprocessString(SOURCE_TEMPLATES.branch, this.githubEvent))
    }
    // Search in pull request commits list
    if (this.githubEvent.pull_request && this.githubEvent.pull_request.number) {
      const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN,
      })
      const { data } = await octokit.pulls.listCommits({
        owner: this.githubEvent.repository.owner.login,
        repo: this.githubEvent.repository.name,
        pull_number: this.githubEvent.pull_request.number
      })
      const commitList = data.reduce((acc, item) => {
        acc.commits.push(item.commit);
      }, { commits: [] });
      stringToSearch.push(this.preprocessString(SOURCE_TEMPLATES.commits, commitList))
    } else if (this.githubEvent.commits && Array.isArray(this.githubEvent.commits)) { // If no pull request in context, we search in local commit list
      stringToSearch.push(this.preprocessString(SOURCE_TEMPLATES.commits, this.githubEvent))
    }

    await Promise.all(stringToSearch.map(async (searchStr) => {
      const foundIssue = await this.findIssueKeyIn(searchStr)
      if (foundIssue) foundIssues.push(...foundIssue)
    }))
  
    return this.uniqueValues === true ? [...new Set(foundIssues)] : foundIssues
  }

  async findIssueKeyIn (searchStr) {
    const match = searchStr.match(JIRA_REF_REGEX)

    console.log(`Searching in string: \n ${searchStr}`)

    if (!match) {
      console.log(`String does not contain any Jira issues`)

      return
    }

    return match
  }

  preprocessString (str, context) {
    _.templateSettings.interpolate = /{{([\s\S]+?)}}/g
    const tmpl = _.template(str)

    return tmpl({ context })
  }
}
