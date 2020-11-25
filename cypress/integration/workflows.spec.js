/// <reference types="cypress" />

context('Workflows', () => {
  beforeEach(() => {
    cy.visit(
      `/namespaces/${Cypress.env('namespace_id')}/workflows?status=OPEN`
    );
  });

  it('navigates to ALL workflows as default', () => {
    cy.visit(`/namespaces/${Cypress.env('namespace_id')}/workflows`);
    cy.url().should('include', '&status=ALL');
  });

  it('renders both open and closed workflows in ALL view', () => {
    cy.visit(`/namespaces/${Cypress.env('namespace_id')}/workflows?status=ALL`);
    cy.get('[data-cy=workflow-list]')
      .find('[data-cy=workflow-row]')
      .should('have.length', 6)
      .should('contain.text', 'wf_canceled')
      .should('contain.text', 'wf_open1')
      .should('contain.text', 'wf_open2')
      .should('contain.text', 'wf_open3')
      .should('contain.text', 'wf_terminated')
      .should('contain.text', 'wf_timedout');
  });

  it('filters workflows by status', () => {
    cy.get('[data-cy=status-filter]')
      .click()
      .find('a')
      .contains('Open')
      .click();
    cy.get('[data-cy=workflow-list]')
      .find('[data-cy=workflow-row]')
      .should('have.length', 4); // 3 open + 1 requested to be canceled

    cy.wait(1000);
    cy.get('[data-cy=status-filter]')
      .click()
      .find('a')
      .contains('Closed')
      .click();
    cy.wait(1000);
    cy.get('[data-cy=workflow-list]')
      .find('[data-cy=workflow-row]')
      .should('have.length', 2); // 1 timed out + 1 terminated

    cy.wait(1000);
    cy.get('[data-cy=status-filter]')
      .click()
      .find('a')
      .contains('Terminated')
      .click();
    cy.wait(1000);
    cy.get('[data-cy=workflow-list]')
      .find('[data-cy=workflow-row]')
      .should('have.length', 1);

    cy.wait(1000);
    cy.get('[data-cy=status-filter]')
      .click()
      .find('a')
      .contains('Timed Out')
      .click();
    cy.wait(1000);
    cy.get('[data-cy=workflow-list]')
      .find('[data-cy=workflow-row]')
      .should('have.length', 1);
  });

  it('renders workflow execution details', () => {
    cy.get('[data-cy=status-filter]')
      .click()
      .find('a')
      .contains('Terminated')
      .click();

    cy.wait(1000);
    cy.get('[data-cy=workflow-list]')
      .find('[data-cy=workflow-row]')
      .eq(0)
      .should('contain.text', 'wf_terminated') // workflow id
      .should('contain.text', 'e2e_type') // workflow type name
      .should('contain.text', 'terminated'); // status
  });

  it('navigates to workflow details', () => {
    cy.get('[data-cy=status-filter]')
      .click()
      .find('a')
      .contains('Timed Out')
      .click();
    cy.wait(1000);
    cy.get('[data-cy=workflow-list]')
      .find('[data-cy=workflow-row]')
      .eq(0)
      .find('[data-cy=workflow-link]')
      .click();

    cy.url().should(
      'include',
      `/namespaces/${Cypress.env('namespace_id')}/workflows/wf_timedout/`
    );
    cy.url().should('include', '/summary');
  });
});
