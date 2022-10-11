# Cypress
We are using Cypress to test our application both the Middle layer and the Presentation layer.

## Project Structure
```bash
test
 ┣ cypress
 ┃ ┣ e2e
 ┃ ┃ ┣ api
 ┃ ┃ ┃ ┗ test.feature #Testing steps definitions for api
 ┃ ┃ ┣ app
 ┃ ┃ ┃ ┗ test.feature #Testing steps definitions for app
 ┃ ┃ ┗ web
 ┃ ┣ fixtures
 ┃ ┃ ┗ example.json #Used for testing definitions
 ┃ ┣ screenshots
 ┃ ┣ support
 ┃ ┃ ┣ step_definitions
 ┃ ┃ ┃ ┣ common-api.js #Common api steps definitions
 ┃ ┃ ┃ ┗ common-web.js #common web steps definitions
 ┃ ┃ ┣ commands-api.js #Cypress Commands api
 ┃ ┃ ┗ e2e.js
 ┣ README.md #Documentation
 ┗ cypress.config.js #Cypress configuration
 ```

## References
- [Cypress Docs](https://docs.cypress.io/)
- [Github Actions Configuration](https://github.com/cypress-io/github-action)
