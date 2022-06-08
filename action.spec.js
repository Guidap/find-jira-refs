const Action = require('./action')

describe("Action", () => {
    describe("test execute method", () => {
      test("Should find nothing when nothing given", async () => {
          const action = new Action({githubEvent: { ref: '', commits: [{ message: '' }] }, string: '' })
          const data = await action.execute()
          expect(data).toEqual([])
      })
      test("Should find nothing when everything is empty", async () => {
          const action = new Action({ githubEvent: {} })
          const data = await action.execute()
          expect(data).toEqual([])
      })
      test("Should find nothing when no Jira ref is given", async () => {
          const action = new Action({githubEvent: { ref: 'master', commits: [{ message: 'Initial commit' }] }, string: 'My super string' })
          const data = await action.execute()
          expect(data).toEqual([])
      })
      
      describe("Should find a single Jira ref", () => {
        test("from a string", async () => {
            const action = new Action({githubEvent: {}, string: 'My super Jira issue is named GD-353' })
            const data = await action.execute()
            expect(data).toEqual(['GD-353'])
        })
        test("from a string with emoji", async () => {
            const action = new Action({githubEvent: {}, string: 'My super Jira issue is named 📚GD-353' })
            const data = await action.execute()
            expect(data).toEqual(['GD-353'])
        })
        test("from a commit message", async () => {
            const action = new Action({githubEvent: { commits: [{ message: 'GD-353: Initial commit' }] }})
            const data = await action.execute()
            expect(data).toEqual(['GD-353'])
        })
        test("from a ref", async () => {
            const action = new Action({githubEvent: { ref: 'GD-353-some-random-branch' }})
            const data = await action.execute()
            expect(data).toEqual(['GD-353'])
        })
      })

      describe("Should find multiple Jira ref from single source", () => {
        test("from a string", async () => {
            const action = new Action({githubEvent: {}, string: 'My super Jira issue is named GD-353 but is not as great as HD-527' })
            const data = await action.execute()
            expect(data.sort()).toEqual(['GD-353', 'HD-527'].sort())
        })
        test("from a string with emoji", async () => {
            const action = new Action({githubEvent: {}, string: 'My super Jira issue is named 📚GD-353 but is not as great as HD-527🚀' })
            const data = await action.execute()
            expect(data.sort()).toEqual(['GD-353', 'HD-527'].sort())
        })
        test("from one commit message", async () => {
            const action = new Action({githubEvent: { commits: [{ message: 'Initial commit for GD-353 and HD-527' }] }})
            const data = await action.execute()
            expect(data.sort()).toEqual(['GD-353', 'HD-527'].sort())
        })
        test("from multiple commit messages with doublon", async () => {
            const action = new Action({githubEvent: { commits: [{ message: 'Initial commit for GD-353 and HD-527' }, { message: 'Fix for GD-353 and FZ-23' }] }, uniqueValues: false})
            const data = await action.execute()
            expect(data.sort()).toEqual(['GD-353', 'GD-353', 'HD-527', 'FZ-23'].sort())
        })
        test("from multiple commit messages with unique values", async () => {
            const action = new Action({githubEvent: { commits: [{ message: 'Initial commit for GD-353 and HD-527' }, { message: 'Fix for GD-353 and FZ-23' }] }})
            const data = await action.execute()
            expect(data.sort()).toEqual(['GD-353', 'HD-527', 'FZ-23'].sort())
        })
        test("from a ref", async () => {
            const action = new Action({githubEvent: { ref: 'GD-353-some-random-branch-also-touching-HD-527-issue',}})
            const data = await action.execute()
            expect(data.sort()).toEqual(['GD-353', 'HD-527'].sort())
        })
      })

      describe("Should find multiple Jira ref from multiple source", () => {
        test("from all sources", async () => {
            const action = new Action({githubEvent: { ref: 'HD-527-initialization-story', commits: [{ message: 'initial commit including FZ-23' }] }, string: 'My super Jira issue is named GD-353'})
            const data = await action.execute()
            expect(data.sort()).toEqual(['GD-353', 'HD-527', 'FZ-23'].sort())
        })
      })
    })
  })