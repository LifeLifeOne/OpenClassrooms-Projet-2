const mockStudents = [
  { id: 1, firstName: 'Alice', lastName: 'Dupont', email: 'alice@example.com' },
  { id: 2, firstName: 'Bob', lastName: 'Martin', email: 'bob@example.com' },
];

describe('Student List', () => {
  beforeEach(() => {
    cy.login();
    cy.intercept('GET', '/api/students', { statusCode: 200, body: mockStudents }).as('getStudents');
    cy.visit('/students');
    cy.wait('@getStudents');
  });

  it('should display the list of students', () => {
    cy.get('[data-cy="students-table"]').should('be.visible');
    cy.get('[data-cy="student-row"]').should('have.length', 2);
    cy.get('[data-cy="student-row"]').first().contains('Alice');
  });

  it('should show empty state when no students', () => {
    cy.intercept('GET', '/api/students', { statusCode: 200, body: [] }).as('getEmpty');
    cy.visit('/students');
    cy.wait('@getEmpty');
    cy.get('[data-cy="no-students-message"]').should('be.visible');
  });

  it('should navigate to create page when clicking Add Student', () => {
    cy.get('[data-cy="add-student-button"]').click();
    cy.url().should('include', '/students/create');
  });

  it('should navigate to detail page when clicking View', () => {
    cy.get('[data-cy="student-row"]').first().find('[data-cy="view-button"]').click();
    cy.url().should('include', '/students/1');
  });

  it('should navigate to edit page when clicking Edit', () => {
    cy.get('[data-cy="student-row"]').first().find('[data-cy="edit-button"]').click();
    cy.url().should('include', '/students/1/edit');
  });

  it('should delete a student', () => {
    cy.intercept('DELETE', '/api/students/1', { statusCode: 200 }).as('deleteStudent');
    cy.intercept('GET', '/api/students', { statusCode: 200, body: [mockStudents[1]] }).as('getAfterDelete');

    cy.get('[data-cy="student-row"]').first().find('[data-cy="delete-button"]').click();

    cy.wait('@deleteStudent');
    cy.get('[data-cy="student-row"]').should('have.length', 1);
  });
});

describe('Student Create', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/students/create');
  });

  it('should display the create form', () => {
    cy.get('[data-cy="firstname-input"]').should('be.visible');
    cy.get('[data-cy="lastname-input"]').should('be.visible');
    cy.get('[data-cy="email-input"]').should('be.visible');
    cy.get('[data-cy="submit-button"]').should('be.visible');
  });

  it('should show validation errors when submitting empty form', () => {
    cy.get('[data-cy="submit-button"]').click();
    cy.contains('First Name is required').should('be.visible');
    cy.contains('Last Name is required').should('be.visible');
    cy.contains('Email is required').should('be.visible');
  });

  it('should create a student and redirect to list', () => {
    cy.intercept('POST', '/api/students', { statusCode: 201, body: { id: 3, firstName: 'Charlie', lastName: 'Brown', email: 'charlie@example.com' } }).as('createStudent');
    cy.intercept('GET', '/api/students', { statusCode: 200, body: mockStudents });

    cy.get('[data-cy="firstname-input"]').type('Charlie');
    cy.get('[data-cy="lastname-input"]').type('Brown');
    cy.get('[data-cy="email-input"]').type('charlie@example.com');
    cy.get('[data-cy="submit-button"]').click();

    cy.wait('@createStudent');
    cy.url().should('include', '/students');
    cy.url().should('not.include', '/create');
  });
});

describe('Student Detail', () => {
  beforeEach(() => {
    cy.login();
    cy.intercept('GET', '/api/students/1', { statusCode: 200, body: mockStudents[0] }).as('getStudent');
    cy.visit('/students/1');
    cy.wait('@getStudent');
  });

  it('should display student details', () => {
    cy.get('[data-cy="student-detail-table"]').should('be.visible');
    cy.get('[data-cy="student-firstname"]').should('contain', 'Alice');
    cy.get('[data-cy="student-lastname"]').should('contain', 'Dupont');
    cy.get('[data-cy="student-email"]').should('contain', 'alice@example.com');
  });

  it('should navigate to edit page when clicking Edit', () => {
    cy.get('[data-cy="edit-button"]').click();
    cy.url().should('include', '/students/1/edit');
  });

  it('should navigate back to list when clicking Back', () => {
    cy.get('[data-cy="back-button"]').click();
    cy.url().should('include', '/students');
    cy.url().should('not.include', '/1');
  });
});

describe('Student Edit', () => {
  beforeEach(() => {
    cy.login();
    cy.intercept('GET', '/api/students/1', { statusCode: 200, body: mockStudents[0] }).as('getStudent');
    cy.visit('/students/1/edit');
    cy.wait('@getStudent');
  });

  it('should display the edit form pre-filled with student data', () => {
    cy.get('[data-cy="firstname-input"]').should('have.value', 'Alice');
    cy.get('[data-cy="lastname-input"]').should('have.value', 'Dupont');
    cy.get('[data-cy="email-input"]').should('have.value', 'alice@example.com');
  });

  it('should show validation errors when clearing required fields', () => {
    cy.get('[data-cy="firstname-input"]').clear();
    cy.get('[data-cy="submit-button"]').click();
    cy.contains('First Name is required').should('be.visible');
  });

  it('should update a student and redirect to list', () => {
    cy.intercept('PUT', '/api/students/1', { statusCode: 200, body: { ...mockStudents[0], firstName: 'Alicia' } }).as('updateStudent');
    cy.intercept('GET', '/api/students', { statusCode: 200, body: mockStudents });

    cy.get('[data-cy="firstname-input"]').clear().type('Alicia');
    cy.get('[data-cy="submit-button"]').click();

    cy.wait('@updateStudent');
    cy.url().should('include', '/students');
    cy.url().should('not.include', '/edit');
  });
});
