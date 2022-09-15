// Get Token

// Get Request Definition
Cypress.Commands.add('getRequest', (endpoint)=>{
  cy.request({
    method: 'GET',
    url: endpoint,
    //headers: {}
  }).then(response =>{
    return cy.wrap(response);
    });
});
