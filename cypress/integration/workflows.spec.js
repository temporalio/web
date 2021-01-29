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
      .should('contain.text', 'wf_open')
      .should('not.contain.text', 'wf_timedout')
      .should('not.contain.text', 'wf_terminated1')

    cy.wait(1000);
    cy.get('[data-cy=status-filter]')
      .click()
      .find('a')
      .contains('Closed')
      .click();
    cy.wait(1000);
    cy.get('[data-cy=workflow-list]')
      .find('[data-cy=workflow-row]')
      .should('not.contain.text', 'wf_open')
      .should('contain.text', 'wf_timedout')
      .should('contain.text', 'wf_terminated1')

    cy.wait(1000);
    cy.get('[data-cy=status-filter]')
      .click()
      .find('a')
      .contains('Terminated')
      .click();
    cy.wait(1000);
    cy.get('[data-cy=workflow-list]')
      .find('[data-cy=workflow-row]')
      .should('not.contain.text', 'wf_open')
      .should('not.contain.text', 'wf_timedout')
      .should('contain.text', 'wf_terminated')

    cy.wait(1000);
    cy.get('[data-cy=status-filter]')
      .click()
      .find('a')
      .contains('Timed Out')
      .click();
    cy.wait(1000);
    cy.get('[data-cy=workflow-list]')
      .find('[data-cy=workflow-row]')
      .should('not.contain.text', 'wf_open')
      .should('contain.text', 'wf_timedout')
      .should('not.contain.text', 'wf_terminated')
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
      .filter(':contains("wf_terminated1")') // workflow id
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
      .filter(':contains("wf_timedout")') // workflow id
      .find('[data-cy=workflow-link]')
      .click();

    cy.url().should(
      'include',
      `/namespaces/${Cypress.env('namespace_id')}/workflows/wf_timedout/`
    );
    cy.url().should('include', '/summary');
  });
});
