import {Then, Given, When} from 'cypress-cucumber-preprocessor/steps';

//Whens
When(`I execute a GET request to {string}`,(url) =>{
  cy.getRequest(url).as('response');
});

//Thens
Then(`response code is {int}`,(code)=>{
  cy.get('@response').should(response =>{
    expect(response.status).to.eq(code);
  });
});
