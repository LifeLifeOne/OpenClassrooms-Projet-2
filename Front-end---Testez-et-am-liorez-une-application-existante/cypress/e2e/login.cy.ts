describe('Login Page', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should display the login form', () => {
    cy.get('[data-cy="login-input"]').should('be.visible');
    cy.get('[data-cy="password-input"]').should('be.visible');
    cy.get('[data-cy="submit-button"]').should('be.visible');
  });

  it('should show validation errors when submitting empty form', () => {
    cy.get('[data-cy="submit-button"]').click();

    cy.contains('Login is required').should('be.visible');
    cy.contains('Password is required').should('be.visible');
  });

  it('should login successfully with valid credentials', () => {
    cy.intercept('POST', '/api/login', {
      statusCode: 200,
      body: 'fake-jwt-token',
    }).as('loginRequest');

    cy.intercept('GET', '/api/students', {
      statusCode: 200,
      body: [],
    });

    cy.get('[data-cy="login-input"]').type('alice@example.com');
    cy.get('[data-cy="password-input"]').type('password123');
    cy.get('[data-cy="submit-button"]').click();

    cy.wait('@loginRequest');
    cy.url().should('include', '/students');
  });

  it('should show error message with invalid credentials', () => {
    cy.intercept('POST', '/api/login', {
      statusCode: 401,
      body: { message: 'Invalid credentials' },
    }).as('loginRequest');

    cy.get('[data-cy="login-input"]').type('wrong@example.com');
    cy.get('[data-cy="password-input"]').type('wrongpassword');
    cy.get('[data-cy="submit-button"]').click();

    cy.wait('@loginRequest');
    cy.get('[data-cy="error-message"]').should('be.visible');
    cy.url().should('include', '/login');
  });
});
