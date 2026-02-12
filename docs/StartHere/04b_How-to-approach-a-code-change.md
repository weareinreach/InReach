# How to approach a code change

# Summary

The following is a general suggestion of how to go about making code changes. The changes can be bug fixes, new features, refactoring, etc. This is only one way of working and is meant to be a guide to help you figure out a way that works best for you.

# Details

1. Understand the product you will be changing
   1. Who uses this product
   2. How do they use it, what are the workflows, what are the use cases
   3. Practice using it yourself
2. Understand the change you will be making
   1. Understand the change request in context (don’t rely on ‘your’ understanding or what you ‘think’ you understand the change to be. If you are not sure, ask for clarification.
   2. Review the request in terms of the workflows and use cases
   3. Ask questions if you’re not clear on the request
   4. Ask questions if you think you ARE clear about the request (use your own words to describe the problem you are being asked to resolve, understand why it is a problem)
3. Before changing anything, research/determine the part of the code that will need to be changed
   1. Find the code itself \- In plain english, summarize what this code is doing
   2. What other areas of the app rely on this code
   3. Look for the existence of unit tests
      1. Run the unit tests locally
      2. Is this part of the code being fully tested?
4. Determine how you can implement the change
   1. In plain english, explain your intended change and organize your thoughts
      1. Create a list of of the changes you will need
      2. For these changes write pseudocode code as needed
      3. Keep it simple \- choose the least convoluted means to achieve the desired results. Remember that often it is more important to ‘make it work’ than to try to make something future proof. Products change, priorities change, don’t over engineer a solution.
   2. Think about what areas of the app can be impacted by this change
   3. Determine how you would test this

# Getting ready to code

This section is more specific to InReach and the process used by the development team.

1. Ensure there is an issue ticket (jira or github) for the request
   1. This should have all of the information you need to do the work. If it is light on information, ask questions and add the details to this ticket. Having the information here ensure all members of the team will have access to the details of the requested change
   2. Capture the use cases and workflows in this ticket
   3. Capture exceptions in this ticket
   4. Include links to design mock-ups if they exist
   5. Basically include anything and everything you find while researching this task
2. Add sub-tasks to the ticket
   1. Sub-tasks are the steps you’ve determined in step 4 above
   2. Ideally, a sub-task is a piece of work that is self contained and does not rely on other code changes to function
   3. Be sure to include updating/creating unit tests or specifying how this change will be tested

# Making the change

1. Create a branch which references this ticket
   1. Almost always you will build with dev as the base. It is the exception that you will be making a hotfix off the main branch
2. Ensure the code runs
   1. Before making any changes, ensure the branch that you just created runs locally
   2. Before making changes, try to reproduce the issue (if a big fix)
3. Make your first change
   1. Keep it simple
   2. Commit it
   3. Push it to github (on your feature/bug branch)
4. Update often (push your changes to github)
   1. As you complete each task \- push your changes to github (the branch you made to track these changes)
5. Prepare to Submit a PR
   1. Once you made all of your code changes locally \- Test it\!
      1. Run tests manually
      2. Unit tests with the UI
         1. Unit tests without the UI (headless)
      3. Fix up any tests that have failed and update github
6. Submit a PR
   1. Ensure the PR is against the correct branch (most likely it will be the dev)
7. PR follow-up
   1. Be prepared to address any issues that come up as part of the review/approval process
