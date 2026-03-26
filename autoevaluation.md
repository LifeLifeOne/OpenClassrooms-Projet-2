# Autoevaluation - Ameliorez et ajoutez des fonctionnalites

---

## Etape 1 - Analysez le code existant

### Technologies installees
- **Java 21** (JDK) + **Maven** pour le back-end Spring Boot
- **Node.js** + **npm** + **Angular CLI 19** pour le front-end
- **Docker Desktop** pour la base de donnees MySQL (via docker-compose)
- **Bruno/Postman** pour tester les APIs

### Lancement du projet
- Back-end : `./mvnw spring-boot:run` (demarre aussi le conteneur MySQL via Spring Boot Docker Compose)
- Front-end : `npm start` (Angular dev server sur le port 4200 avec proxy vers le port 8080)

### Probleme rencontre : TestContainers
Lors du lancement des tests d'integration (`mvn clean test`), les tests echouaient avec l'erreur : `Could not find a valid Docker environment`.

**Cause :** Le starter code utilisait TestContainers 1.20.0 qui communiquait avec Docker via l'API v1.32, alors que Docker Desktop (v4.66+) exige minimum l'API v1.40. Docker renvoyait un code 400 (Bad Request).

**Solution :** Mise a jour de TestContainers de 1.20.0 vers 2.0.3 dans le `pom.xml`, avec mise a jour des noms d'artifacts (`junit-jupiter` -> `testcontainers-junit-jupiter`, `mysql` -> `testcontainers-mysql`).

---

## Notes pour l'oral - Structure et fonctionnement du code existant

### Architecture globale

Le projet est une application full-stack composee de deux parties separees :

- **Back-end** : API REST en Spring Boot 3 (Java 21) qui gere l'authentification des utilisateurs et les operations CRUD sur les etudiants
- **Front-end** : Application Angular 19 qui consomme les APIs du back-end
- **Base de donnees** : MySQL 8.0, lancee via Docker Compose

### Structure du Back-end (Spring Boot)

Le back-end suit une **architecture en couches** classique :

```
Controller  ->  Service  ->  Repository  ->  Base de donnees
   (DTO)          (Entity)      (JPA)          (MySQL)
```

**1. Controller (couche d'entree/sortie)**
- `UserController` : gere `/api/register`, `/api/login`, `/api/users`
- `StudentController` : gere le CRUD sur `/api/students`
- Recoit des **DTO** (Data Transfer Objects), jamais des entites directement
- Utilise les annotations `@RestController`, `@PostMapping`, `@GetMapping`, etc.

**2. Service (couche metier)**
- `UserService` : logique d'inscription (encodage du mot de passe) et de login (verification + generation du token JWT)
- `StudentService` : logique CRUD pour les etudiants
- `JwtService` : generation et validation des tokens JWT
- Annote avec `@Service` et `@Transactional`

**3. Repository (couche d'acces aux donnees)**
- `UserRepository` et `StudentRepository` : interfaces qui etendent `JpaRepository`
- Spring Data JPA genere automatiquement les requetes SQL
- Methode custom : `findByLogin()` pour chercher un utilisateur par son login

**4. Entites**
- `User` : implemente `UserDetails` de Spring Security (login, password, firstName, lastName)
- `Student` : entite simple (firstName, lastName, email)
- Mappees sur les tables MySQL via JPA (`@Entity`, `@Table`)

**5. DTO et Mappers**
- Les DTO (`RegisterDTO`, `LoginRequestDTO`, `StudentDTO`) sont les objets echanges avec le front-end
- Les Mappers (`UserDtoMapper`, `StudentDtoMapper`) convertissent DTO <-> Entity via MapStruct

**6. Securite**
- `SpringSecurityConfig` : configure les routes publiques et protegees, mode stateless (pas de session)
- `JwtAuthenticationFilter` : intercepte chaque requete, extrait et valide le Bearer Token
- `CustomUserDetailService` : charge un utilisateur depuis la BDD pour Spring Security
- Mot de passe encode avec BCrypt

### Structure du Front-end (Angular)

```
app/
├── core/
│   ├── guard/        -> authGuard (protege les routes), loginGuard (redirige si deja connecte)
│   ├── interceptor/  -> ajoute le Bearer Token a chaque requete HTTP
│   ├── models/       -> interfaces TypeScript (Register, Login, Student) = les DTO
│   └── service/      -> UserService (register, login), StudentService (CRUD), AuthService (token)
├── pages/
│   ├── register/     -> formulaire d'inscription
│   ├── login/        -> formulaire de connexion
│   └── students/     -> liste, detail, creation, modification d'etudiants
└── shared/
    └── material.module.ts -> module Angular Material
```

**Points cles :**
- **Composants standalone** : chaque composant importe ses propres dependances (Angular 19)
- **Formulaires reactifs** : utilisation de `FormBuilder` et `Validators` pour la validation
- **Observables RxJS** : les appels HTTP retournent des `Observable`, souscrits avec `subscribe()`
- **Intercepteur HTTP** : ajoute automatiquement le header `Authorization: Bearer <token>` a chaque requete
- **Guards** : `authGuard` redirige vers `/login` si pas de token, `loginGuard` redirige vers `/students` si deja connecte
- **Gestion des etats** : chaque composant gere les etats loading, erreur et succes

### Flux d'authentification

1. L'utilisateur s'inscrit via `/api/register` (mot de passe encode avec BCrypt en BDD)
2. Il se connecte via `/api/login` : le back-end verifie le mot de passe et retourne un token JWT
3. Le front-end stocke le token en `sessionStorage`
4. L'intercepteur HTTP ajoute le token a chaque requete suivante
5. Le filtre JWT cote back-end valide le token et authentifie l'utilisateur
6. Les routes `/api/students/**` sont accessibles uniquement avec un token valide

### Communication Front-Back

```
Angular (port 4200)  --proxy-->  Spring Boot (port 8080)  --JPA-->  MySQL (port 3306)
     StudentService                 StudentController                  student table
     (HttpClient)                   (REST endpoints)                   (JPA Entity)
```

Le fichier `proxy.conf.json` d'Angular redirige les appels `/api/*` vers `localhost:8080` en developpement.

---

## Version oral (texte complet)

Alors voici ce que j'ai compris du projet. On a une application full-stack avec un back-end et un front-end completement separes. Le back-end c'est une API REST en Spring Boot 3 avec Java 21, le front-end c'est une application Angular 19, et la base de donnees c'est MySQL 8 qui tourne dans un conteneur Docker.

Pour la structure du back-end, ca suit une architecture en couches classique. En gros, quand une requete arrive depuis le front, elle passe d'abord par le Controller. Le Controller, c'est lui qui recoit les requetes HTTP et qui renvoie les reponses. Il travaille uniquement avec des DTO, c'est-a-dire des objets de transfert, jamais directement avec les entites de la base de donnees. Ca permet de bien separer ce qu'on expose a l'exterieur de ce qu'on stocke en interne.

Ensuite le Controller appelle le Service. C'est la que se trouve la logique metier. Par exemple, dans le UserService, c'est la qu'on encode le mot de passe avec BCrypt quand un utilisateur s'inscrit, et c'est la aussi qu'on verifie le mot de passe et qu'on genere le token JWT quand il se connecte. Pour les etudiants, le StudentService gere toute la logique CRUD : creation, lecture, modification, suppression.

Le Service appelle ensuite le Repository. C'est l'interface qui communique avec la base de donnees. On utilise Spring Data JPA, donc on n'a pas besoin d'ecrire les requetes SQL nous-memes, Spring les genere automatiquement a partir des methodes qu'on declare dans l'interface. Par exemple, on a une methode findByLogin qui cherche un utilisateur par son login, et Spring sait generer la requete SQL correspondante tout seul.

Pour la conversion entre les DTO et les entites, on utilise MapStruct. C'est une librairie qui genere automatiquement le code de mapping a la compilation. Par exemple, le StudentDtoMapper sait convertir un StudentDTO en entite Student et inversement.

Cote securite, c'est Spring Security qui gere tout. On a une configuration stateless, c'est-a-dire qu'il n'y a pas de session serveur. A la place, on utilise des tokens JWT. Quand un utilisateur se connecte, le back-end lui renvoie un token. Ensuite, a chaque requete, le front-end envoie ce token dans le header Authorization. Cote back-end, on a un filtre JWT qui intercepte chaque requete, extrait le token, le valide en verifiant la signature et la date d'expiration, et authentifie l'utilisateur dans le contexte Spring Security. Les routes publiques comme /api/register et /api/login sont accessibles sans token, mais les routes /api/students sont protegees et necessitent un token valide.

Cote front-end maintenant. L'application Angular est organisee avec un dossier core qui contient tout ce qui est transversal : les services, les guards, l'intercepteur HTTP et les models. Les models, ce sont les interfaces TypeScript qui correspondent aux DTO du back-end, ca permet de s'assurer que les donnees echangees entre le front et le back sont coherentes.

On a un intercepteur HTTP qui s'ajoute automatiquement a chaque requete. Son role, c'est de regarder si un token JWT est stocke dans le sessionStorage, et si oui, il l'ajoute dans le header Authorization de la requete. Comme ca, on n'a pas besoin de le faire manuellement dans chaque service.

Pour la protection des routes, on utilise des Guards Angular. Le authGuard verifie si l'utilisateur a un token avant de le laisser acceder aux pages des etudiants. S'il n'a pas de token, il est redirige vers la page de login. On a aussi un loginGuard qui fait l'inverse : si l'utilisateur est deja connecte et qu'il essaie d'aller sur la page de login, il est redirige directement vers la liste des etudiants.

Les composants Angular sont tous standalone, c'est le style Angular 19. Chaque composant importe ses propres dependances. Les formulaires utilisent les Reactive Forms avec FormBuilder et Validators pour la validation. Les appels HTTP retournent des Observables RxJS, et chaque composant gere trois etats : le chargement, l'erreur et le succes.

Pour le flux complet d'authentification : l'utilisateur s'inscrit, son mot de passe est encode avec BCrypt et stocke en base. Ensuite il se connecte, le back-end verifie le mot de passe et genere un token JWT. Le front-end stocke ce token dans le sessionStorage. A partir de la, l'intercepteur l'ajoute automatiquement a chaque requete, et le filtre JWT cote back-end le valide pour autoriser l'acces aux APIs protegees.

Un probleme que j'ai rencontre au debut, c'est avec TestContainers. Les tests d'integration ne fonctionnaient pas, Docker renvoyait une erreur alors qu'il marchait bien dans le terminal. En fait, la version 1.20.0 de TestContainers utilisait une vieille version de l'API Docker qui n'etait plus compatible avec Docker Desktop recent. La solution a ete de passer a TestContainers 2.0.3, ce qui a aussi necessite de renommer les artifacts dans le pom.xml.

Voila, en resume le projet suit les bonnes pratiques : separation des couches, utilisation de DTO pour ne pas exposer les entites, securisation par JWT, et cote front on a les guards, l'intercepteur et les formulaires reactifs avec gestion des erreurs.
