//Helper Functions
const  executeRequest = (request) =>{
  cy.request(request).then(response =>{
    return cy.wrap(response);
    });
};

Cypress.Commands.add('getFixture',(path)=>{
  cy.fixture(path).then(fixture=>{
    return cy.wrap(fixture);
  });
});

// GET Request
Cypress.Commands.add('apiRequestGET', (endpoint)=>{
    executeRequest({method:'GET',url:endpoint});
});
//PUT Request
Cypress.Commands.add('apiRequestPUT', (endpoint,hasBody)=>{
  if(hasBody){
    cy.get('@body').then(body=>{
      executeRequest({method:'PUT',url:endpoint, body:body});
    });
  }else{
    executeRequest({method:'PUT',url:endpoint});
  }
});
//PATCH Request
Cypress.Commands.add('apiRequestPATCH',(endpoint,hasbody)=>{
  if(hasbody){
    cy.get('@body').then(body=>{
      executeRequest({method:'PATCH',url:endpoint,body:body});
    });
  }else{
    executeRequest({method:'PATCH',url:endpoint});
  }
});
// POST Request
Cypress.Commands.add('apiRequestPOST',(endpoint,hasbody)=>{
  if(hasbody){
    cy.get('@body').then(body=>{
      executeRequest({method:'POST',url:endpoint,body:body});
    });
  }else{
    executeRequest({method:'POST',url:endpoint});
  }
});

// DELETE Request
Cypress.Commands.add('apiRequestDELETE',(endpoint)=>{
  executeRequest({method:'DELETE',url:endpoint});
});
  

