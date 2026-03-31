# Project Instructions

## Tech Stack
- Angular 19 with standalone components
- TypeScript 5.7 (strict mode)
- Angular Material for UI
- RxJS for async operations
- Jest for testing

## Code Style
- Standalone components with `imports` array (not NgModules)
- Use `inject()` function for DI, not constructor injection
- Use `takeUntilDestroyed(this.destroyRef)` for subscription cleanup
- File naming: kebab-case (e.g., `student-list.component.ts`)
- Model interfaces in `core/models/` with PascalCase names

## Testing
- Run tests: `npm test`
- Run tests (watch): `npm run test:watch`
- Test files: `*.spec.ts` colocated with source
- Use `HttpTestingController` for mocking HTTP requests
- Coverage report: `coverage/` directory (HTML)

## Build & Run
- Dev server: `npm start` (localhost:4200, proxies /api to :8080)
- Build: `npm run build`
- Requires backend running on localhost:8080

## Project Structure
```
src/app/
├── pages/              # Page components
│   ├── login/
│   ├── register/
│   └── students/       # CRUD components
├── core/
│   ├── service/        # Injectable services
│   ├── guard/          # Route guards
│   ├── interceptor/    # HTTP interceptors
│   └── models/         # TypeScript interfaces
├── shared/             # Shared modules (Material)
├── app.routes.ts       # Route definitions
└── app.config.ts       # App providers
```

## Authentication
- JWT stored in sessionStorage (via AuthService)
- authInterceptor adds Bearer token to all /api requests
- authGuard protects /students/** routes
- loginGuard redirects authenticated users away from /login

## API Proxy
- `/api/*` proxied to `http://localhost:8080` (see proxy.conf.json)
- Backend must be running for dev server to work
