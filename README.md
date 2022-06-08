# Github Action for finding Jira Issue References
Extract Jira issue references from different sources in a single Github Action.

This repository used the official https://github.com/atlassian/gajira-find-issue-key.

We changed its behavior to match our needs :
 * Identify multiple issues at once
 * Do not check if those are real issues with Jira API (it improves performance as it wasn't necessary for our cases)

## Usage

To find issue keys inside github event (branch name, commits name):
```yaml
- name: Find in commit messages
  uses: guidap/find-jira-refs@master
```

To add custom string in which you also want to check for Jira keys:
```yaml
- name: Find in commit messages
  uses: guidap/find-jira-refs@master
  with:
    string: 'My custom string containing HT-456 Jira issue key.'
```

----
## Action Spec:

### Environment variables
- None

### Inputs
- `string` - Provide a string to extract issue key from (optional)
- `unique-values` - Indicate if we want to filter duplicates or not (optional, default: `true`)

### Outputs
- `issues` - Key of the found issue
