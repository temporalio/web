/// <reference types="cypress" />

context('Workflow Details', () => {
  beforeEach(() => {
    cy.visit('/namespaces/namespace-web-e2e/workflows?range=last-5-days&status=OPEN');

    cy.get('[data-cy=workflow-list]')
      .find('tr')
      .eq(0)
      .find('[data-cy=workflow-link]')
      .click();
    cy.url().should('include', '/summary');
  });

  it('navigates between summary/history/../query tabs', () => {
    cy.get('[data-cy=history-link]').click()
    cy.get('[data-cy=history]')
    cy.get('[data-cy=stack-trace-link]').click()
    cy.get('[data-cy=stack-trace]')
    cy.get('[data-cy=query-link]').click()
    cy.get('[data-cy=query]')
    cy.get('[data-cy=summary-link]').click()
    cy.get('[data-cy=summary]').should('contain.text', 'Workflow Name')
  });
});
