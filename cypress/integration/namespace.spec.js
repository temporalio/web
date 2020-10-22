/// <reference types="cypress" />

context('Namespace', () => {
  beforeEach(() => {
    cy.visit('/namespaces');
  });

  it('renders namespace details', () => {
    cy.get('[data-cy=recent-namespaces]')
      .contains(Cypress.env('namespace_id'))
      .trigger('mouseover');

    cy.get('[data-cy=namespace-description]')
      .should('contain.text', Cypress.env('namespace_id')) // Namespace name
      .should('contain.text', 'description-for-web-e2e') // Description
      .should('contain.text', 'user0@test.com') // Owner
      .should('contain.text', '5 days') // Retention Period
      .should('contain.text', 'Disabled') // History & Visibility statuses
      .should('not.contain.text', 'Enabled')
      .should('contain.text', 'active (active)'); // Clusters
  });

  it('navigates to recent namespace', () => {
    cy.get('[data-cy=recent-namespaces]')
      .contains(Cypress.env('namespace_id'))
      .click();

    cy.url().should('include', `/namespaces/${Cypress.env('namespace_id')}/workflows`);
  });

  it('renders namespace settings', () => {
    cy.get('[data-cy=recent-namespaces]')
      .contains(Cypress.env('namespace_id'))
      .click();

    cy.get('[data-cy=namespace-settings-link]').click();

    cy.url().should('include', `/namespaces/${Cypress.env('namespace_id')}/settings`);

    cy.get('[data-cy=namespace-settings]')
      .should('contain.text', Cypress.env('namespace_id')) // Namespace name
      .should('contain.text', 'description-for-web-e2e') // Description
      .should('contain.text', 'user0@test.com') // Owner
      .should('contain.text', '5 days') // Retention Period
      .should('contain.text', 'Disabled') // History & Visibility statuses
      .should('not.contain.text', 'Enabled')
      .should('contain.text', 'active (active)'); // Clusters
  });
});
