@api
Feature: Test

    @e2e 
    Scenario: Get Request Example
        When I execute a GET request to "www.google.com"
        Then response code is 200

    @e2e2
    Scenario: Get Request Example2
        When I execute a GET request to "www.cypress.io"
        Then response code is 200
