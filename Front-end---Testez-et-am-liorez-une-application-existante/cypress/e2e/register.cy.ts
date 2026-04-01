describe('Register Page', () => {
  beforeEach(() => {
    cy.visit('/register');
  });

  it('should display the registration form', () => {
    cy.get('[data-cy="firstname-input"]').should('be.visible');
    cy.get('[data-cy="lastname-input"]').should('be.visible');
    cy.get('[data-cy="login-input"]').should('be.visible');
    cy.get('[data-cy="password-input"]').should('be.visible');
    cy.get('[data-cy="submit-button"]').should('be.visible');
  });

  it('should show validation errors when submitting empty form', () => {
    cy.get('[data-cy="submit-button"]').click();

    cy.contains('First Name is required').should('be.visible');
    cy.contains('Last Name is required').should('be.visible');
    cy.contains('Login is required').should('be.visible');
    cy.contains('password is required').should('be.visible');
  });

  it('should register successfully and redirect to login', () => {
    cy.intercept('POST', '/api/register', {
      statusCode: 200,
      body: {},
    }).as('registerRequest');

    cy.get('[data-cy="firstname-input"]').type('Alice');
    cy.get('[data-cy="lastname-input"]').type('Dupont');
    cy.get('[data-cy="login-input"]').type('alice@example.com');
    cy.get('[data-cy="password-input"]').type('password123');
    cy.get('[data-cy="submit-button"]').click();

    cy.wait('@registerRequest');
    cy.url().should('include', '/login');
  });
});
