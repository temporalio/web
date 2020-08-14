/// <reference types="cypress" />

context('Workflow', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8088/')
  })  

  it('History page should render no items message if items count = 0', () => {
    cy.get('.no-results')
      .contains('No Results')
  })
})
