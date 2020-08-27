/// <reference types="cypress" />

context('Workflow', () => {
  beforeEach(() => {
    cy.visit('/namespaces/namespace-web-e2e/workflows');
  });

  it('navigates to open workflows as default', () => {
    cy.url().should('include', '&status=OPEN');
  });

  it('filters workflows by status', () => {
    cy.get('[data-cy=status-filter]')
      .click()
      .find('a')
      .contains('Open')
      .click();
    cy.get('[data-cy=workflow-list]')
      .find('tr')
      .should('have.length', 4); // 3 open + 1 requested to be canceled

    cy.wait(1000);
    cy.get('[data-cy=status-filter]')
      .click()
      .find('a')
      .contains('Closed')
      .click();
    cy.get('[data-cy=workflow-list]')
      .find('tr')
      .should('have.length', 2); // 1 timed out + 1 terminated

    cy.wait(1000);
    cy.get('[data-cy=status-filter]')
      .click()
      .find('a')
      .contains('Terminated')
      .click();
    cy.get('[data-cy=workflow-list]')
      .find('tr')
      .should('have.length', 1);

    cy.wait(1000);
    cy.get('[data-cy=status-filter]')
      .click()
      .find('a')
      .contains('Timed Out')
      .click();
    cy.get('[data-cy=workflow-list]')
      .find('tr')
      .should('have.length', 1);
  });

  it('renders workflow execution details', () => {
    cy.get('[data-cy=status-filter]')
      .click()
      .find('a')
      .contains('Terminated')
      .click();

    cy.get('[data-cy=workflow-list]')
      .find('tr')
      .eq(0)
      .should('contain.text', 'wf_terminated') // workflow id
      .should('contain.text', 'e2e_type') // workflow type name
      .should('contain.text', 'terminated'); // status
  });

  it('navigates to workflow details', () => {
    cy.wait(1000);
    cy.get('[data-cy=status-filter]')
      .click()
      .find('a')
      .contains('Closed')
      .click();
    cy.get('[data-cy=workflow-list]')
      .find('tr')
      .eq(0)
      .find('[data-cy=workflow-link]')
      .click();

      cy.url().should('include', '/namespaces/namespace-web-e2e/workflows/wf_timedout/');
      cy.url().should('include', '/summary');
  });
});
