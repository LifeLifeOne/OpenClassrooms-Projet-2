# Corrections de l'API d'authentification - Point 1

## Analyse du probleme

L'endpoint `POST /api/login` ne fonctionnait pas. Apres analyse du code, **4 bugs** et **1 dependance manquante** ont ete identifies.

---

## Bug 1 : Comparaison du mot de passe incorrecte (`UserService.java`, ligne 40)

**Avant :**
```java
passwordEncoder.matches(password, password)
```

**Apres :**
```java
passwordEncoder.matches(password, user.get().getPassword())
```

**Explication :** La methode `matches` de `PasswordEncoder` prend en premier parametre le mot de passe en clair et en second le hash stocke en base. Ici, le code comparait le mot de passe en clair avec lui-meme au lieu de le comparer avec le hash de l'utilisateur recupere en base de donnees. Le resultat etait que `matches` retournait toujours `false` (un mot de passe en clair ne correspond jamais a lui-meme quand il est interprete comme un hash BCrypt), donc l'authentification echouait systematiquement.

---

## Bug 2 : `JwtService.generateToken()` non implemente (`JwtService.java`)

**Avant :**
```java
public String generateToken(UserDetails userDetails) {
    return null; // TODO
}
```

**Apres :**
```java
public String generateToken(UserDetails userDetails) {
    return Jwts.builder()
            .subject(userDetails.getUsername())
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + expiration))
            .signWith(getSigningKey())
            .compact();
}
```

**Explication :** Le service retournait `null` au lieu de generer un token JWT. L'implementation utilise la librairie JJWT pour creer un token signe contenant le nom d'utilisateur (subject), la date de creation, et une date d'expiration (24h). La cle de signature est configuree dans `application.yml`.

---

## Bug 3 : Annotation `@RequestBody` manquante (`UserController.java`, ligne 31)

**Avant :**
```java
public ResponseEntity<?> login(LoginRequestDTO loginRequestDTO) {
```

**Apres :**
```java
public ResponseEntity<?> login(@RequestBody LoginRequestDTO loginRequestDTO) {
```

**Explication :** Sans l'annotation `@RequestBody`, Spring ne deserialise pas le corps JSON de la requete HTTP dans l'objet `LoginRequestDTO`. Les champs `login` et `password` restaient donc `null`, ce qui empechait l'authentification de fonctionner.

---

## Bug 4 : Construction incorrecte de `UserDetails` dans `UserService.login()` (ligne 46-47)

**Avant :**
```java
UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
        .username(login).build();
return jwtService.generateToken(userDetails);
```

**Apres :**
```java
return jwtService.generateToken(user.get());
```

**Explication :** Le code construisait un nouvel objet `UserDetails` via le builder Spring Security en ne fournissant que le `username`, sans le `password`. Or le builder `User` de Spring Security exige un password non-null, ce qui provoquait l'erreur `"Cannot pass null or empty values to constructor"`. La correction consiste a passer directement l'entite `User` (qui implemente deja `UserDetails`) au `JwtService`, ce qui est plus simple et correct.

---

## Dependance manquante : librairie JJWT (`pom.xml`)

**Ajout :**
```xml
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.6</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.6</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.6</version>
    <scope>runtime</scope>
</dependency>
```

**Explication :** La librairie JJWT n'etait pas presente dans les dependances Maven, ce qui rendait impossible l'implementation de la generation de tokens JWT.

---

## Configuration ajoutee (`application.yml`)

```yaml
jwt:
  secret: WnNkZm9pZXJ0Z2hqa2xhc2RmZ2hqa2x6eGN2Ym5tMTIzNDU2Nzg5MGFiY2RlZg==
  expiration: 86400000
```

- `secret` : cle secrete encodee en Base64 utilisee pour signer les tokens JWT
- `expiration` : duree de validite du token en millisecondes (24 heures)

---

## Fichiers modifies

| Fichier | Modification |
|---------|-------------|
| `UserService.java` | Correction de la comparaison du mot de passe + utilisation directe de l'entite User comme UserDetails |
| `JwtService.java` | Implementation de la generation du token JWT |
| `UserController.java` | Ajout de `@RequestBody` sur le endpoint login |
| `pom.xml` | Ajout des dependances JJWT |
| `application.yml` | Ajout de la configuration JWT (secret + expiration) |

## Test avec Postman

1. D'abord, enregistrer un utilisateur : `POST /api/register` avec un body JSON
2. Ensuite, se connecter : `POST /api/login` avec `{"login": "...", "password": "..."}`
3. La reponse doit contenir un token JWT (longue chaine de caracteres)

---

# Point 2 : Interface utilisateur d'authentification (Front-end)

## Fichiers crees

| Fichier | Role |
|---------|------|
| `core/models/Login.ts` | DTO (interface) pour la requete de login avec les champs `login` et `password` |
| `pages/login/login.component.ts` | Composant Angular pour l'ecran de login, gere le formulaire, les etats (chargement, erreur, succes) et l'appel API |
| `pages/login/login.component.html` | Template du formulaire avec validation, affichage des erreurs serveur et message de succes |
| `pages/login/login.component.css` | Fichier de style (vide, pas de CSS specifique requis) |

## Fichiers modifies

| Fichier | Modification |
|---------|-------------|
| `core/service/user.service.ts` | Ajout de la methode `login()` qui appelle `POST /api/login` |
| `core/service/user-mock.service.ts` | Ajout de la methode `login()` mock pour les tests |
| `app.routes.ts` | Ajout de la route `/login` vers `LoginComponent` |

## Architecture respectee

Le composant login suit exactement le meme modele que le register existant :
- **Model** : interface `Login` (DTO) dans `core/models/`
- **Service** : methode `login()` dans `UserService` (couche service dans `core/service/`)
- **Composant** : `LoginComponent` dans `pages/login/` avec formulaire reactif
- **Mock** : methode `login()` ajoutee dans `UserMockService` pour les tests

## Gestion des etats

- **Chargement** : le bouton affiche "Loading..." et est desactive pendant l'appel API
- **Erreur** : les erreurs serveur s'affichent dans une alerte rouge sous le formulaire
- **Succes** : un message de confirmation s'affiche quand le token est recu

## Test

1. Demarrer le back-end et le front-end
2. Naviguer vers `http://localhost:4200/login`
3. Saisir un login et mot de passe d'un utilisateur existant
4. Cliquer sur "Login"
5. Verifier que le message "Authentication successful! Token received." s'affiche

---

# Point 3 : APIs CRUD pour la gestion des etudiants

## Architecture en couches

| Couche | Fichier | Role |
|--------|---------|------|
| **DTO** | `StudentDTO.java` | Objet de transfert avec validation (`@NotBlank`) - les entites n'apparaissent pas dans le controller |
| **Controller** | `StudentController.java` | Gere les entrees/sorties HTTP (`/api/students/**`) |
| **Service** | `StudentService.java` | Logique metier (creation, lecture, mise a jour, suppression) |
| **Repository** | `StudentRepository.java` | Acces aux donnees via JPA |
| **Entity** | `Student.java` | Entite JPA mappee sur la table `student` |
| **Mapper** | `StudentDtoMapper.java` | Conversion DTO <-> Entity via MapStruct |

## Endpoints implementes

| Methode | URL | Description | Auth requise |
|---------|-----|-------------|-------------|
| `POST` | `/api/students` | Ajouter un etudiant | Oui (Bearer Token) |
| `GET` | `/api/students` | Liste de tous les etudiants | Oui (Bearer Token) |
| `GET` | `/api/students/{id}` | Details d'un etudiant | Oui (Bearer Token) |
| `PUT` | `/api/students/{id}` | Modifier un etudiant | Oui (Bearer Token) |
| `DELETE` | `/api/students/{id}` | Supprimer un etudiant | Oui (Bearer Token) |

## Securisation par JWT

### Filtre JWT (`JwtAuthenticationFilter.java`)
- Intercepte chaque requete HTTP
- Extrait le token du header `Authorization: Bearer <token>`
- Valide le token (signature + expiration)
- Authentifie l'utilisateur dans le `SecurityContext` de Spring

### Methodes ajoutees dans `JwtService.java`
- `extractUsername(token)` : extrait le username du token
- `isTokenValid(token, userDetails)` : verifie la validite du token
- `extractClaims(token)` : parse le token avec la cle secrete

### Configuration Spring Security mise a jour
- Le filtre JWT est ajoute avant `UsernamePasswordAuthenticationFilter`
- `/api/students/**` requiert une authentification
- `/api/register`, `/api/login`, `/api/users` restent publics

## Test avec Postman

1. `POST /api/login` pour obtenir un token JWT
2. Copier le token dans la variable `{{jwt_token}}` ou dans le header `Authorization: Bearer <token>`
3. Tester chaque endpoint CRUD avec le token

---

# Point 4 : Ecrans front-end pour gerer les etudiants

## Architecture

### Services
| Fichier | Role |
|---------|------|
| `core/service/auth.service.ts` | Gestion du token JWT (stockage en sessionStorage, verification d'authentification, logout) |
| `core/service/student.service.ts` | Appels API CRUD vers `/api/students` |
| `core/interceptor/auth.interceptor.ts` | Intercepteur HTTP qui ajoute automatiquement le header `Authorization: Bearer <token>` a chaque requete |

### Guard
| Fichier | Role |
|---------|------|
| `core/guard/auth.guard.ts` | Protege les routes `/students/**` : redirige vers `/login` si l'utilisateur n'est pas connecte |

### Models
| Fichier | Role |
|---------|------|
| `core/models/Student.ts` | Interface TypeScript (DTO) pour Student avec `id?`, `firstName`, `lastName`, `email` |

### Composants (pages)
| Composant | Route | Description |
|-----------|-------|-------------|
| `StudentListComponent` | `/students` | Tableau avec liste des etudiants + boutons View, Edit, Delete |
| `StudentDetailComponent` | `/students/:id` | Affiche les details d'un etudiant |
| `StudentCreateComponent` | `/students/create` | Formulaire de creation d'un etudiant |
| `StudentEditComponent` | `/students/:id/edit` | Formulaire de modification pre-rempli |

## Securisation des routes

- Le `authGuard` Angular protege toutes les routes sous `/students/**`
- Si l'utilisateur n'est pas connecte (pas de token en sessionStorage), il est redirige vers `/login`
- L'intercepteur HTTP ajoute automatiquement le Bearer Token a chaque requete API

## Flux utilisateur

1. L'utilisateur arrive sur `/login`
2. Il se connecte -> le token JWT est stocke en sessionStorage -> redirection vers `/students`
3. Il peut consulter, creer, modifier, supprimer des etudiants
4. Il peut se deconnecter via le bouton Logout (supprime le token et redirige vers `/login`)

## Gestion des etats

- **Chargement** : message "Loading..." affiche pendant les appels API, boutons desactives
- **Erreur** : les erreurs serveur s'affichent dans une alerte rouge
- **Succes** : redirection automatique apres creation/modification

## Fichiers modifies

| Fichier | Modification |
|---------|-------------|
| `app.routes.ts` | Ajout des routes students protegees par authGuard + redirection racine vers login |
| `app.config.ts` | Ajout de l'intercepteur HTTP pour le Bearer Token |
| `login.component.ts` | Stockage du token via AuthService + redirection vers /students apres login |
| `login.component.html` | Retrait du message de succes (remplace par la redirection) |
