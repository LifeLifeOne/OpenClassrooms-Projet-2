# Cours : Les Tests Jest dans Angular

## C'est quoi Jest ?

Jest est un **framework de test JavaScript** créé par Facebook. Il permet de :
- Exécuter des tests automatiquement
- Vérifier que ton code fonctionne comme prévu
- Détecter les bugs avant qu'ils n'arrivent en production

**Analogie** : C'est comme un assistant qui vérifie ton travail à chaque fois que tu modifies du code.

---

## Où trouver les tests dans le projet ?

```
Front-end---Testez-et-am-liorez-une-application-existante/
└── src/app/
    ├── core/service/
    │   ├── auth.service.ts          ← Le service
    │   ├── auth.service.spec.ts     ← LE TEST du service
    │   ├── student.service.ts
    │   ├── student.service.spec.ts  ← LE TEST
    │   ├── user.service.ts
    │   └── user.service.spec.ts     ← LE TEST
    ├── pages/
    │   ├── register/
    │   │   ├── register.component.ts
    │   │   └── register.component.spec.ts  ← LE TEST
    │   └── students/student-list/
    │       ├── student-list.component.ts
    │       └── student-list.component.spec.ts  ← LE TEST
    └── app.component.spec.ts
```

**Convention** : Le test est TOUJOURS à côté du fichier source avec `.spec.ts`

| Fichier source | Fichier de test |
|----------------|-----------------|
| `auth.service.ts` | `auth.service.spec.ts` |
| `login.component.ts` | `login.component.spec.ts` |

---

## Comment lancer les tests ?

```bash
cd Front-end---Testez-et-am-liorez-une-application-existante

# Lancer tous les tests une fois
npm test

# Lancer en mode "watch" (re-exécute à chaque modification)
npm run test:watch

# Voir le rapport de couverture
# → Ouvre coverage/index.html dans ton navigateur
```

---

## Structure d'un fichier de test

```typescript
// 1. IMPORTS
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

// 2. DESCRIBE = Groupe de tests pour une fonctionnalité
describe('AuthService', () => {

  // 3. VARIABLES partagées entre les tests
  let service: AuthService;

  // 4. BEFOREEACH = Exécuté AVANT chaque test
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  // 5. IT = UN test individuel
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should store token in sessionStorage', () => {
    service.setToken('my-token');
    expect(sessionStorage.getItem('jwt_token')).toBe('my-token');
  });

});
```

### Décortiquons :

| Élément | Rôle | Analogie |
|---------|------|----------|
| `describe()` | Groupe de tests | Un chapitre du livre |
| `beforeEach()` | Préparation avant chaque test | Mettre la table avant chaque repas |
| `it()` | UN test | Une question d'examen |
| `expect()` | Vérification | La réponse attendue |

---

## Les assertions : `expect()`

C'est la partie qui vérifie le résultat.

```typescript
// Égalité
expect(result).toBe(5);              // Égalité stricte (===)
expect(result).toEqual({a: 1});      // Égalité profonde (objets)

// Vérité
expect(value).toBeTruthy();          // Est "vrai" (pas null, undefined, 0, '')
expect(value).toBeFalsy();           // Est "faux"
expect(value).toBeNull();            // Est null
expect(value).toBeDefined();         // N'est pas undefined

// Nombres
expect(count).toBeGreaterThan(5);    // > 5
expect(count).toBeLessThan(10);      // < 10

// Chaînes
expect(text).toContain('hello');     // Contient "hello"
expect(text).toMatch(/pattern/);     // Match une regex

// Tableaux
expect(array).toHaveLength(3);       // Longueur = 3
expect(array).toContain('item');     // Contient 'item'

// Fonctions appelées (avec les mocks)
expect(mockFn).toHaveBeenCalled();           // A été appelée
expect(mockFn).toHaveBeenCalledWith('arg');  // Appelée avec 'arg'
expect(mockFn).toHaveBeenCalledTimes(2);     // Appelée 2 fois
```

---

## Exemple 1 : Tester un Service simple

### Le service (`auth.service.ts`)
```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'jwt_token';

  setToken(token: string): void {
    sessionStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    sessionStorage.removeItem(this.tokenKey);
  }
}
```

### Le test (`auth.service.spec.ts`)
```typescript
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    // Configure le module de test
    TestBed.configureTestingModule({});
    // Récupère une instance du service
    service = TestBed.inject(AuthService);
    // Nettoie sessionStorage avant chaque test
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set token in sessionStorage', () => {
    // WHEN - Action
    service.setToken('my-token');
    
    // THEN - Vérification
    expect(sessionStorage.getItem('jwt_token')).toBe('my-token');
  });

  it('should get token from sessionStorage', () => {
    // GIVEN - Contexte
    sessionStorage.setItem('jwt_token', 'stored-token');
    
    // WHEN & THEN
    expect(service.getToken()).toBe('stored-token');
  });

  it('should return true when authenticated', () => {
    service.setToken('any-token');
    expect(service.isAuthenticated()).toBe(true);
  });

  it('should return false when not authenticated', () => {
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should remove token on logout', () => {
    service.setToken('my-token');
    service.logout();
    expect(service.getToken()).toBeNull();
  });
});
```

---

## Exemple 2 : Tester un Service avec HTTP

### Le service (`student.service.ts`)
```typescript
@Injectable({ providedIn: 'root' })
export class StudentService {
  private apiUrl = '/api/students';

  constructor(private httpClient: HttpClient) {}

  getAll(): Observable<Student[]> {
    return this.httpClient.get<Student[]>(this.apiUrl);
  }

  create(student: Student): Observable<Student> {
    return this.httpClient.post<Student>(this.apiUrl, student);
  }
}
```

### Le test (`student.service.spec.ts`)
```typescript
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { StudentService } from './student.service';

describe('StudentService', () => {
  let service: StudentService;
  let httpMock: HttpTestingController;  // Pour intercepter les requêtes HTTP

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        StudentService,
        provideHttpClient(),
        provideHttpClientTesting(),  // Active le mock HTTP
      ]
    });
    service = TestBed.inject(StudentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Vérifie qu'il n'y a pas de requêtes non traitées
    httpMock.verify();
  });

  it('should fetch all students via GET', () => {
    // GIVEN - Données mockées
    const mockStudents = [
      { id: 1, firstName: 'Alice', lastName: 'Martin', email: 'alice@test.com' },
      { id: 2, firstName: 'Bob', lastName: 'Dupont', email: 'bob@test.com' }
    ];

    // WHEN - Appel du service
    service.getAll().subscribe(students => {
      // THEN - Vérifications
      expect(students.length).toBe(2);
      expect(students).toEqual(mockStudents);
    });

    // Intercepte la requête et simule la réponse
    const req = httpMock.expectOne('/api/students');
    expect(req.request.method).toBe('GET');
    req.flush(mockStudents);  // Envoie la réponse mockée
  });

  it('should create a student via POST', () => {
    const newStudent = { firstName: 'Charlie', lastName: 'Brown', email: 'charlie@test.com' };

    service.create(newStudent).subscribe(student => {
      expect(student.firstName).toBe('Charlie');
    });

    const req = httpMock.expectOne('/api/students');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newStudent);
    req.flush({ ...newStudent, id: 3 });
  });
});
```

### Comment ça marche ?

```
┌─────────────────────────────────────────────────────────────┐
│  TEST                                                       │
│                                                             │
│  1. service.getAll().subscribe(...)                         │
│         │                                                   │
│         ▼                                                   │
│  2. httpMock.expectOne('/api/students')                     │
│         │         ↑                                         │
│         │         │ Intercepte la requête                   │
│         ▼         │                                         │
│  3. req.flush(mockStudents)                                 │
│         │                                                   │
│         ▼                                                   │
│  4. Le subscribe reçoit mockStudents                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Exemple 3 : Tester un Composant

### Le composant (`student-list.component.ts`)
```typescript
@Component({
  selector: 'app-student-list',
  templateUrl: './student-list.component.html'
})
export class StudentListComponent implements OnInit {
  students: Student[] = [];
  loading = false;

  constructor(private studentService: StudentService) {}

  ngOnInit() {
    this.loadStudents();
  }

  loadStudents(): void {
    this.loading = true;
    this.studentService.getAll().subscribe(data => {
      this.students = data;
      this.loading = false;
    });
  }
}
```

### Le test (`student-list.component.spec.ts`)
```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudentListComponent } from './student-list.component';
import { StudentService } from '../../../core/service/student.service';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('StudentListComponent', () => {
  let component: StudentListComponent;
  let fixture: ComponentFixture<StudentListComponent>;
  let studentServiceSpy: any;

  const mockStudents = [
    { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@test.com' },
    { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane@test.com' }
  ];

  beforeEach(async () => {
    // Crée un MOCK du service
    studentServiceSpy = {
      getAll: jest.fn().mockReturnValue(of(mockStudents))
    };

    await TestBed.configureTestingModule({
      imports: [StudentListComponent],
      providers: [
        // Remplace le vrai service par le mock
        { provide: StudentService, useValue: studentServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StudentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();  // Déclenche ngOnInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load students on init', () => {
    // Vérifie que le service a été appelé
    expect(studentServiceSpy.getAll).toHaveBeenCalled();
    // Vérifie que les données sont chargées
    expect(component.students.length).toBe(2);
    expect(component.students).toEqual(mockStudents);
  });

  it('should display students in the DOM', () => {
    // Cherche les lignes du tableau dans le HTML
    const rows = fixture.debugElement.queryAll(By.css('tbody tr'));
    expect(rows.length).toBe(2);

    // Vérifie le contenu de la première ligne
    const firstRow = rows[0].nativeElement.textContent;
    expect(firstRow).toContain('John');
    expect(firstRow).toContain('Doe');
  });
});
```

### La différence clé : le MOCK

```typescript
// MOCK = Faux service qui retourne des données contrôlées
studentServiceSpy = {
  getAll: jest.fn().mockReturnValue(of(mockStudents))
};

// On dit à Angular : "utilise ce mock au lieu du vrai service"
providers: [
  { provide: StudentService, useValue: studentServiceSpy }
]
```

**Pourquoi mocker ?**
- Pas besoin du backend
- Tests rapides et fiables
- On contrôle exactement les données

---

## Les Mocks : Comment ça marche ?

### Créer un mock de fonction
```typescript
const mockFn = jest.fn();  // Fonction vide

// Avec une valeur de retour
const mockFn = jest.fn().mockReturnValue(42);
mockFn();  // → 42

// Avec un Observable (Angular)
const mockFn = jest.fn().mockReturnValue(of(data));
```

### Créer un mock de service
```typescript
const serviceMock = {
  getAll: jest.fn().mockReturnValue(of([])),
  create: jest.fn().mockReturnValue(of(newItem)),
  delete: jest.fn().mockReturnValue(of(void 0))
};
```

### Vérifier les appels
```typescript
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
expect(mockFn).toHaveBeenCalledTimes(3);
```

---

## Pattern GIVEN / WHEN / THEN

Structure recommandée pour chaque test :

```typescript
it('should do something', () => {
  // GIVEN - Contexte, préparation
  const input = 'test';
  
  // WHEN - Action à tester
  const result = service.transform(input);
  
  // THEN - Vérification
  expect(result).toBe('TEST');
});
```

---

## Checklist pour écrire un test

1. [ ] **Quel fichier tester ?** → Crée `fichier.spec.ts` à côté
2. [ ] **Quoi tester ?** → Liste les méthodes/comportements
3. [ ] **Quelles dépendances mocker ?** → Services, HTTP, etc.
4. [ ] **Quels cas tester ?**
   - Cas normal (happy path)
   - Cas d'erreur
   - Cas limites (liste vide, null, etc.)

---

## Erreurs courantes de débutant

### 1. Oublier `fixture.detectChanges()`
```typescript
// ❌ Le DOM n'est pas mis à jour
fixture = TestBed.createComponent(MyComponent);
expect(fixture.debugElement.query(By.css('.title'))).toBeTruthy();

// ✅ Correct
fixture = TestBed.createComponent(MyComponent);
fixture.detectChanges();  // Met à jour le DOM
expect(fixture.debugElement.query(By.css('.title'))).toBeTruthy();
```

### 2. Ne pas attendre les Observables
```typescript
// ❌ Le test finit avant la réponse
service.getAll().subscribe(data => {
  expect(data.length).toBe(2);
});
// Le test passe même si l'assertion est fausse !

// ✅ Avec httpMock, flush() déclenche la réponse
service.getAll().subscribe(data => {
  expect(data.length).toBe(2);
});
req.flush(mockData);  // Déclenche le subscribe
```

### 3. Tester l'implémentation au lieu du comportement
```typescript
// ❌ Teste comment c'est fait (fragile)
expect(component.privateMethod).toHaveBeenCalled();

// ✅ Teste ce qui est visible/utile
expect(component.students.length).toBe(2);
expect(screen.getByText('Alice')).toBeInTheDocument();
```

---

## Commandes utiles

```bash
# Lancer un seul fichier de test
npm test -- auth.service.spec.ts

# Lancer les tests avec un pattern
npm test -- --testPathPattern="service"

# Voir la couverture détaillée
npm test -- --coverage
```

---

## Résumé en 5 points

1. **Fichier de test** = même nom avec `.spec.ts`
2. **`describe()`** = groupe, **`it()`** = un test
3. **`expect()`** = vérifier le résultat
4. **Mock** = faux service pour contrôler les données
5. **GIVEN/WHEN/THEN** = structure claire

---

## Ressources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Angular Testing Guide](https://angular.io/guide/testing)
- [jest-preset-angular](https://github.com/thymikee/jest-preset-angular)

---

Maintenant, à toi de jouer !
