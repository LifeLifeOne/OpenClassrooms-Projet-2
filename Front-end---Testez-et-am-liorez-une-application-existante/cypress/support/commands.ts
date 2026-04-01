declare global {
  namespace Cypress {
    interface Chainable {
      login(): Chainable<void>;
    }
  }
}

Cypress.Commands.add('login', () => {
  cy.window().then((win) => {
    win.sessionStorage.setItem('jwt_token', 'fake-jwt-token');
  });
});

export {};
