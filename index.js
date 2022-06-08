const core = require('@actions/core')

const Action = require('./action')

// eslint-disable-next-line import/no-dynamic-require
const githubEvent = require(process.env.GITHUB_EVENT_PATH)
console.log(githubEvent)

async function exec () {
  try {
    const result = await new Action({
      githubEvent,
      ...parseArgs(),
    }).execute()

    if (!result) {
      console.log('No issue keys found.')
      return;
    }

    const issues = result.issues.join(' ')
    console.log(`Detected issueKey: ${issues}`)

    // Expose created issue's key as an output
    core.setOutput('issues', result.issues)
  } catch (error) {
    core.setFailed(error.toString())
  }
}

function parseArgs () {
  return {
    string: core.getInput('string'),
    uniqueValues: core.getInput('unique-values'),
  }
}

exec()
