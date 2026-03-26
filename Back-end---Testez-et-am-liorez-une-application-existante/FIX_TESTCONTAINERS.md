# Fix TestContainers - Docker Desktop / WSL2

## Le probleme

En lançant `mvn clean test`, les tests d'integration echouaient avec l'erreur :

```
Could not find a valid Docker environment. Please see logs and check configuration
```

Le conteneur MySQL utilise par TestContainers ne pouvait pas demarrer, alors que Docker fonctionnait correctement dans le terminal (`docker info`, `docker ps`, etc.).

## La cause

TestContainers 1.20.0 utilise en interne la librairie docker-java qui communique avec Docker via une API REST sur le socket Unix `/var/run/docker.sock`.

Le souci, c'est que cette version envoie ses requetes avec une ancienne version de l'API Docker (v1.32). Or, Docker Desktop (v4.66+) exige au minimum la version 1.40 de l'API. Quand il recoit une requete avec une version trop ancienne, il repond avec un code 400 (Bad Request) et des donnees vides, ce que TestContainers interprete comme "Docker n'est pas disponible".

## La solution

Mise a jour de TestContainers de la version 1.20.0 vers la 2.0.3 dans le `pom.xml`.

En passant a la version 2.x, les noms des artifacts ont change, il a donc fallu aussi les mettre a jour :

| Avant (1.x)      | Apres (2.x)                    |
|-------------------|--------------------------------|
| `junit-jupiter`  | `testcontainers-junit-jupiter` |
| `mysql`          | `testcontainers-mysql`         |

### Modifications dans le `pom.xml`

```xml
<!-- Version -->
<testcontainers.version>2.0.3</testcontainers.version>

<!-- Dependencies -->
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>testcontainers-junit-jupiter</artifactId>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>testcontainers-mysql</artifactId>
    <scope>test</scope>
</dependency>
```
