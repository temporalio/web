/// <reference types="cypress" />

context('Workflow Summary', () => {
  beforeEach(() => {
    cy.visit(
      `/namespaces/${Cypress.env(
        'namespace_id'
      )}/workflows?range=last-5-days&status=WORKFLOW_EXECUTION_STATUS_TIMED_OUT`
    );

    cy.get('[data-cy=workflow-list]')
      .find('[data-cy=workflow-link]')
      .eq(0)
      .click();
    cy.url().should('include', '/summary');
  });

  it('renders workflow summary', () => {
    cy.get('[data-cy=workflow-name]').should('contain.text', 'e2e_type');

    const dateTimeRegex = /\w+\s\w+\s[\d\w]+,\s(\d{1,2}:?){3}\s(am|pm)/;
    cy.get('[data-cy=started-at]').contains(dateTimeRegex);
    cy.get('[data-cy=closed-at]').contains(dateTimeRegex);

    cy.get('[data-cy=workflow-status]').should('contain.text', 'timedout');

    cy.get('[data-cy=workflow-result]')
      .should('contain.text', 'retryState')
      .should('contain.text', 'Timeout');

    cy.get('[data-cy=workflow-id]').should('contain.text', 'wf_timedout');

    const uidRegex = /([\w\d]{4,12}-?){5}/;
    cy.get('[data-cy=run-id]').contains(uidRegex);

    cy.get('[data-cy=task-queue]').should('contain.text', 'e2eQueue');

    cy.get('[data-cy=history-length]').should('contain.text', '3');

    cy.get('[data-cy=workflow-input]')
      .should('contain.text', 'to infinity and beyond')
      .should('contain.text', '""');
  });
});
