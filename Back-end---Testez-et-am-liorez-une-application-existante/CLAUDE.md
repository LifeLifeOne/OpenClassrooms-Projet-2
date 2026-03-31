# Project Instructions

## Tech Stack
- Java 21 + Spring Boot 3.5.5
- MySQL via Docker Compose
- Spring Security + JWT (jjwt 0.12.6)
- Lombok + MapStruct
- JUnit 5 + Mockito + Testcontainers

## Code Style
- PascalCase for classes, camelCase for methods/variables
- DTOs in `dto/` package, entities in `entities/`
- MapStruct for DTO<->Entity conversion
- `@RequiredArgsConstructor` for dependency injection (Lombok)
- `@Slf4j` for logging

## Testing
- Run tests: `mvn clean test` (requires Docker Desktop for Testcontainers)
- Unit tests: Mockito with `@ExtendWith(SpringExtension.class)`
- Integration tests: `@SpringBootTest` + `@Testcontainers` with MySQL container
- Test naming: descriptive method names like `getAllReturnsListOfStudents()`
- Structure: GIVEN/WHEN/THEN comments
- Coverage: JaCoCo report at `target/site/jacoco/index.html`

## Build & Run
- Dev: `mvn spring-boot:run` (auto-starts MySQL Docker container)
- Build: `mvn clean package`
- Prerequisites: Docker Desktop running

## Project Structure
```
src/main/java/com/openclassrooms/etudiant/
├── controller/     # REST endpoints
├── service/        # Business logic
├── repository/     # Spring Data JPA interfaces
├── entities/       # JPA entities (Student, User)
├── dto/            # Request/Response DTOs
├── mapper/         # MapStruct mappers
├── configuration/  # Security, logging config
└── handler/        # Global exception handling
```

## API Security
- Public: `/api/register`, `/api/login`, `/api/users`, `/actuator/**`
- Protected (JWT required): `/api/students/**`

## Conventions
- Commit style: `type: description` (French descriptions OK)
- Error handling: throw `IllegalArgumentException` for not found
- Validation: `@Valid` on controller method params
