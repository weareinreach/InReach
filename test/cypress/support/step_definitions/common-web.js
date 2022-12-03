import { Given, Then, When } from 'cypress-cucumber-preprocessor/steps'

//Whens
When(`I visit the site {string}`, (url) => {
	cy.visit(url)
})

//Thens
Then(`address should be {string}`, (address) => {
	cy.url().should((url) => {
		expect(url).to.eq(address)
	})
})
