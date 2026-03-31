# Cours : Les Tests E2E avec Cypress

## C'est quoi un test E2E ?

**E2E = End-to-End = De bout en bout**

Imagine que tu es un utilisateur qui arrive sur ton site. Tu vas :
1. Ouvrir la page de login
2. Taper ton email
3. Taper ton mot de passe
4. Cliquer sur "Se connecter"
5. Voir la liste des étudiants

Un **test E2E simule exactement ce parcours utilisateur**, comme un robot qui clique vraiment sur ton site.

---

## La différence avec les autres tests

| Type de test | Quoi ? | Exemple |
|--------------|--------|---------|
| **Unit test** | Teste UNE fonction isolée | `add(2, 3)` retourne `5` |
| **Integration test** | Teste plusieurs composants ensemble | Le service HTTP + le composant |
| **E2E test** | Teste l'application ENTIERE comme un vrai utilisateur | Ouvrir le navigateur, cliquer, vérifier |

### Analogie : Tester une voiture

- **Test unitaire** = Tester que le moteur démarre
- **Test d'intégration** = Tester que le moteur + la boîte de vitesse fonctionnent ensemble
- **Test E2E** = Monter dans la voiture, démarrer, rouler jusqu'à destination

---

## Pourquoi Cypress ?

Cypress est un outil qui :
- Ouvre un vrai navigateur (Chrome, Firefox...)
- Exécute des actions (cliquer, taper, naviguer)
- Vérifie les résultats (texte affiché, URL, éléments visibles)
- Prend des screenshots/vidéos automatiquement

**Avantage** : Tu vois le test s'exécuter en temps réel !

---

## Structure d'un test Cypress

```javascript
describe('Login', () => {
  it('should login successfully with valid credentials', () => {
    // 1. GIVEN - Contexte initial
    cy.visit('/login');
    
    // 2. WHEN - Actions utilisateur
    cy.get('input[name="email"]').type('alice@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    // 3. THEN - Vérifications
    cy.url().should('include', '/students');
    cy.contains('Liste des étudiants').should('be.visible');
  });
});
```

### Décortiquons :

| Commande | Ce que ça fait |
|----------|----------------|
| `describe('Login', ...)` | Groupe de tests pour la fonctionnalité "Login" |
| `it('should...', ...)` | UN test avec sa description |
| `cy.visit('/login')` | Ouvre la page /login dans le navigateur |
| `cy.get('input[name="email"]')` | Trouve l'élément HTML avec ce sélecteur |
| `.type('alice@example.com')` | Tape ce texte dans l'input |
| `.click()` | Clique sur l'élément |
| `.should('include', '/students')` | Vérifie que l'URL contient "/students" |
| `cy.contains('Liste')` | Trouve un élément contenant ce texte |
| `.should('be.visible')` | Vérifie qu'il est visible |

---

## Les sélecteurs : Comment trouver un élément ?

Cypress utilise des sélecteurs CSS. Voici les plus courants :

```javascript
// Par ID
cy.get('#mon-bouton')

// Par classe CSS
cy.get('.btn-primary')

// Par attribut
cy.get('input[name="email"]')
cy.get('[data-testid="submit-btn"]')  // Recommandé !

// Par type d'élément
cy.get('button')

// Par texte contenu
cy.contains('Se connecter')

// Combinaison
cy.get('form').find('button[type="submit"]')
```

### Bonne pratique : `data-testid`

Ajoute des attributs `data-testid` dans ton HTML :

```html
<button data-testid="login-button">Se connecter</button>
```

```javascript
cy.get('[data-testid="login-button"]').click();
```

**Pourquoi ?** Les classes CSS peuvent changer (style), mais `data-testid` est stable.

---

## Les assertions : Vérifier le résultat

```javascript
// Vérifier qu'un élément existe
cy.get('.message').should('exist');

// Vérifier qu'un élément est visible
cy.get('.message').should('be.visible');

// Vérifier le texte
cy.get('.title').should('have.text', 'Bienvenue');
cy.get('.title').should('contain', 'Bien');  // Contient

// Vérifier l'URL
cy.url().should('include', '/dashboard');
cy.url().should('eq', 'http://localhost:4200/students');

// Vérifier un attribut
cy.get('input').should('have.value', 'test@example.com');
cy.get('button').should('be.disabled');

// Vérifier le nombre d'éléments
cy.get('.student-card').should('have.length', 5);
```

---

## Mocker les appels API : Pourquoi et comment ?

### Le problème

Ton frontend appelle le backend (`/api/students`). Mais en test E2E :
- Le backend doit tourner
- La base de données doit avoir des données
- C'est lent et fragile

### La solution : Intercepter les appels

```javascript
it('should display students list', () => {
  // MOCK : Intercepte GET /api/students et retourne des fausses données
  cy.intercept('GET', '/api/students', {
    statusCode: 200,
    body: [
      { id: 1, firstName: 'Alice', lastName: 'Martin', email: 'alice@test.com' },
      { id: 2, firstName: 'Bob', lastName: 'Dupont', email: 'bob@test.com' }
    ]
  }).as('getStudents');  // Donne un alias

  cy.visit('/students');
  
  cy.wait('@getStudents');  // Attend que l'appel soit intercepté
  
  cy.get('.student-card').should('have.length', 2);
  cy.contains('Alice Martin').should('be.visible');
});
```

### Intercepter différents scénarios

```javascript
// Succès
cy.intercept('POST', '/api/login', {
  statusCode: 200,
  body: 'fake-jwt-token'
});

// Erreur 401
cy.intercept('POST', '/api/login', {
  statusCode: 401,
  body: { message: 'Invalid credentials' }
});

// Erreur serveur
cy.intercept('GET', '/api/students', {
  statusCode: 500,
  body: { message: 'Server error' }
});
```

---

## Structure des fichiers Cypress

```
frontend/
├── cypress/
│   ├── e2e/                    # Tes fichiers de tests
│   │   ├── login.cy.ts
│   │   ├── register.cy.ts
│   │   └── students.cy.ts
│   ├── fixtures/               # Données de test (JSON)
│   │   └── students.json
│   ├── support/
│   │   ├── commands.ts         # Commandes personnalisées
│   │   └── e2e.ts              # Config globale des tests
│   └── screenshots/            # Screenshots auto en cas d'échec
├── cypress.config.ts           # Configuration Cypress
```

---

## Exemple complet : Test du Login

```javascript
// cypress/e2e/login.cy.ts

describe('Login Page', () => {
  
  beforeEach(() => {
    // Avant chaque test, on visite la page login
    cy.visit('/login');
  });

  it('should display login form', () => {
    cy.get('input[name="email"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('should login successfully with valid credentials', () => {
    // Mock l'API login
    cy.intercept('POST', '/api/login', {
      statusCode: 200,
      body: 'fake-jwt-token'
    }).as('loginRequest');

    // Mock l'API students (page suivante)
    cy.intercept('GET', '/api/students', {
      statusCode: 200,
      body: []
    });

    // Remplit le formulaire
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    // Vérifie que l'API a été appelée
    cy.wait('@loginRequest');

    // Vérifie la redirection
    cy.url().should('include', '/students');
  });

  it('should show error message with invalid credentials', () => {
    // Mock l'API login avec erreur
    cy.intercept('POST', '/api/login', {
      statusCode: 401,
      body: { message: 'Invalid credentials' }
    }).as('loginRequest');

    cy.get('input[name="email"]').type('wrong@example.com');
    cy.get('input[name="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest');

    // Vérifie le message d'erreur
    cy.contains('Invalid credentials').should('be.visible');
    
    // On reste sur la page login
    cy.url().should('include', '/login');
  });

  it('should disable submit button when form is empty', () => {
    cy.get('button[type="submit"]').should('be.disabled');
  });
});
```

---

## Commandes utiles

```javascript
// Navigation
cy.visit('/login');           // Aller à une URL
cy.go('back');                // Retour arrière
cy.reload();                  // Rafraîchir la page

// Interactions
cy.get('input').type('texte');
cy.get('input').clear();      // Vider un champ
cy.get('button').click();
cy.get('select').select('Option 1');
cy.get('checkbox').check();
cy.get('checkbox').uncheck();

// Attente
cy.wait('@aliasApi');         // Attendre un appel API
cy.wait(1000);                // Attendre 1 seconde (à éviter)

// Debug
cy.pause();                   // Mettre en pause le test
cy.debug();                   // Mode debug
```

---

## Commandes personnalisées (DRY)

Si tu répètes souvent le login, crée une commande :

```javascript
// cypress/support/commands.ts
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.intercept('POST', '/api/login', {
    statusCode: 200,
    body: 'fake-jwt-token'
  });
  
  cy.visit('/login');
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
});
```

Utilisation :

```javascript
// Dans tes tests
cy.login('test@example.com', 'password123');
cy.visit('/students');  // Déjà connecté !
```

---

## Les fixtures : Données de test réutilisables

```json
// cypress/fixtures/students.json
[
  { "id": 1, "firstName": "Alice", "lastName": "Martin", "email": "alice@test.com" },
  { "id": 2, "firstName": "Bob", "lastName": "Dupont", "email": "bob@test.com" }
]
```

```javascript
// Dans ton test
cy.fixture('students').then((students) => {
  cy.intercept('GET', '/api/students', students);
});

// Ou plus court
cy.intercept('GET', '/api/students', { fixture: 'students.json' });
```

---

## Checklist avant de commencer

1. [ ] Installer Cypress : `npm install cypress --save-dev`
2. [ ] Créer le fichier `cypress.config.ts`
3. [ ] Créer le dossier `cypress/e2e/`
4. [ ] Lancer Cypress : `npx cypress open`

---

## Ordre recommandé pour tes tests

1. **Login** - Le plus simple, formulaire basique
2. **Register** - Similaire au login
3. **Student List** - Affichage avec mock API
4. **Student Create** - Formulaire + redirection
5. **Student Edit** - Charger données + modifier
6. **Student Delete** - Action avec confirmation

---

## Résumé en 5 points

1. **E2E = Simuler un vrai utilisateur** qui navigue sur ton site
2. **`cy.get()` + `.click()` + `.type()`** = Les actions de base
3. **`.should()`** = Vérifier le résultat attendu
4. **`cy.intercept()`** = Mocker les appels API (pas besoin de backend)
5. **Un test = Un scénario utilisateur** (login réussi, login échoué, etc.)

---

## Ressources

- [Documentation officielle Cypress](https://docs.cypress.io/)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Cypress Real World App](https://github.com/cypress-io/cypress-realworld-app) - Exemple complet

---

Prêt à écrire tes premiers tests E2E ? Let's go !
