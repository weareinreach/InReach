import { Given, Then, When, defineParameterType } from 'cypress-cucumber-preprocessor/steps'

const TEMP_FIXTURE = 'cypress/fixtures/temp'

//Define parameter types
defineParameterType({
	name: 'boolean',
	regexp: /true|false/,
	transformer: (s) => (s === 'true' ? true : false),
})

//Given
Given(`Request body {string}`, (path) => {
	cy.getFixture(path).as('body')
})

Given(`Request headers {string}`, (path) => {
	cy.getFixture(path).as('headers')
})

Given(`Save response as {string}`, (filename) => {
	cy.get('@response').then((response) => {
		cy.writeFile(`${TEMP_FIXTURE}/${filename}`, response)
	})
})

//Whens
When(`I execute a GET request to {string}`, (url) => {
	cy.apiRequestGET(url).as('response')
})

When(`I execute a POST request to {string} with body {boolean}`, (url, hasbody) => {
	cy.apiRequestPOST(url, hasbody).as('response')
})

When(`I execute a PATCH request to {string} with body {boolean}`, (url, hasbody) => {
	cy.apiRequestPATCH(url, hasbody).as('response')
})

When(`I execute a PUT request to {string} with body {boolean}`, (url, hasbody) => {
	cy.apiRequestPUT(url, hasbody).as('response')
})

When(`I execute a DELETE request to {string}`, (url) => {
	cy.apiRequestDELETE(url).as('response')
})

//Thens
Then(`response code is {int}`, (code) => {
	cy.get('@response').should((response) => {
		expect(response.status).to.eq(code)
	})
})

Then(`response body is {string}`, (path) => {
	cy.fixture(path).then((fixture) => {
		cy.get('@response').then((body) => {
			expect(fixture).to.eq(body)
		})
	})
})

Then(`response body value of key {string} is value {string}`, (key, value) => {
	cy.get('@response').then((body) => {
		expect(key.split('.').reduce((o, i) => o[i], body)).to.eq(value)
	})
})

Then(
	`response body value of key {string} matches fixture {string} with key {string}`,
	(key, fixture, key2) => {
		cy.get('@response').then((body) => {
			cy.fixture(fixture).then((fixtureJson) => {
				expect(key.split('.').reduce((o, i) => o[i], body)).to.eq(
					key2.split('.').reduce((o, i) => o[i], fixtureJson)
				)
			})
		})
	}
)
