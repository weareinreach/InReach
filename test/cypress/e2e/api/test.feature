@api @stepsTesting
Feature: Test

    @e2e @getResquest
    Scenario: Get Request Example
        When I execute a GET request to "www.google.com"
        Then response code is 200

    @e2e @postRequestNoBody
    Scenario: Post Request Example No body
        When I execute a POST request to "http://httpbin.org/post" with body false
        Then response code is 200

    @e2e @postRequestBody
    Scenario: Post Request Example with body
        Given Request body "example.json"
        When I execute a POST request to "http://httpbin.org/post" with body true
        Then response code is 200

    @e2e @putRequestBody
    Scenario: Put Request Example with body
        Given Request body "example.json"
        When I execute a PUT request to "http://httpbin.org/put" with body true
        Then response code is 200

    @e2e @putRequestNoBody
    Scenario: Put Request Example No body
        When I execute a PUT request to "http://httpbin.org/put" with body false
        Then response code is 200

    @e2e @patchRequestBody
    Scenario: Patch Request Example with body
        Given Request body "example.json"
        When I execute a PATCH request to "http://httpbin.org/patch" with body true
        Then response code is 200

    @e2e @patchRequestBody
    Scenario: Patch Request Example No body
        When I execute a PATCH request to "http://httpbin.org/patch" with body false
        Then response code is 200
    
    @e2e @deleteRequest
    Scenario: Delete Request Example
        When I execute a DELETE request to "http://httpbin.org/delete"
        Then response code is 200

    @e2e @responseBody
    Scenario: Compare Body of Response
        Given Request body "example.json"
        When I execute a POST request to "http://httpbin.org/post" with body true
        Then response code is 200
        #Then response body is "example.json"

    @e2e @responseKey
    Scenario: Compare Body key of Response
        Given Request body "example.json"
        When I execute a POST request to "http://httpbin.org/post" with body true
        Then response code is 200
        Then response body value of key "body.json.email" is value "hello@cypress.io"

    @e2e @responseKeyArray
    Scenario: Compare Body key of Response array key
        Given Request body "example.json"
        When I execute a POST request to "http://httpbin.org/post" with body true
        Then response code is 200
        Then response body value of key "body.json.actions.0" is value "create"
        Then response body value of key "body.json.actions.1" is value "update"

    @e2e @responseKeyFixture
    Scenario: Compare Body key of Response with Fixture
        Given Request body "example.json"
        When I execute a POST request to "http://httpbin.org/post" with body true
        Then response code is 200
        Then response body value of key "body.json.email" matches fixture "example.json" with key "email"

    @e2e @saveResponse
    Scenario: Save Response Body as Temp
        Given Request body "example.json"
        When I execute a POST request to "http://httpbin.org/post" with body true
        Then response code is 200
        Given Save response as "example-1.json"
        Then response body value of key "body.json.email" matches fixture "temp/example-1.json" with key "body.json.email"

