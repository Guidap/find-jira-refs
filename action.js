const _ = require('lodash')

const JIRA_REF_REGEX = /([a-zA-Z0-9]+-[0-9]+)/g

const SOURCE_TEMPLATES = {
  branch: '{{event.ref}}',
  commits: "{{event.commits.map(c=>c.message).join(' ')}}",
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

    const templates = [];
    if (this.githubEvent.commits && Array.isArray(this.githubEvent.commits)) {
      templates.push(SOURCE_TEMPLATES.commits)
    }
    if (this.githubEvent.ref && typeof this.githubEvent.ref === 'string') {
      templates.push(SOURCE_TEMPLATES.branch)
    }
    await Promise.all(templates.map(async (template) => {
      const searchStr = this.preprocessString(template)
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

  preprocessString (str) {
    _.templateSettings.interpolate = /{{([\s\S]+?)}}/g
    const tmpl = _.template(str)

    return tmpl({ event: this.githubEvent })
  }
}
