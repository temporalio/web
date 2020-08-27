/// <reference types="cypress" />

context('Namespace', () => {
  beforeEach(() => {
    cy.visit('/namespaces');
  });

  it('renders namespace details', () => {
    cy.get('[data-cy=recent-namespaces]')
      .contains('namespace-web-e2e')
      .trigger('mouseover');

    cy.get('[data-cy=namespace-description]')
      .should('contain.text', 'namespace-web-e2e') // Namespace name
      .should('contain.text', 'description-for-web-e2e') // Description
      .should('contain.text', 'user0@test.com') // Owner
      .should('contain.text', '5 days') // Retention Period
      .should('contain.text', 'Disabled') // History & Visibility statuses
      .should('not.contain.text', 'Enabled')
      .should('contain.text', 'active (active)'); // Clusters
  });

  it('navigates to recent namespace', () => {
    cy.get('[data-cy=recent-namespaces]')
      .contains('namespace-web-e2e')
      .click();

    cy.url().should('include', '/namespaces/namespace-web-e2e/workflows');
  });

  it('renders namespace settings', () => {
    cy.get('[data-cy=recent-namespaces]')
      .contains('namespace-web-e2e')
      .click();

    cy.get('[data-cy=namespace-settings-link]').click();

    cy.url().should('include', '/namespaces/namespace-web-e2e/settings');

    cy.get('[data-cy=namespace-settings]')
      .should('contain.text', 'namespace-web-e2e') // Namespace name
      .should('contain.text', 'description-for-web-e2e') // Description
      .should('contain.text', 'user0@test.com') // Owner
      .should('contain.text', '5 days') // Retention Period
      .should('contain.text', 'Disabled') // History & Visibility statuses
      .should('not.contain.text', 'Enabled')
      .should('contain.text', 'active (active)'); // Clusters
  });
});
