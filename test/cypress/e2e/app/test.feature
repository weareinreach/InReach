@app 
Feature: Test

    @e2e
    Scenario: Visit website Google
        When I visit the site "https://www.google.com"
        Then address should be "https://www.google.com/"

    @e2e2
    Scenario: Visit website Cypress
        When I visit the site "https://nextjs.org"
        Then address should be "https://nextjs.org/"
