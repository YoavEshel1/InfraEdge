# Plan: Angular Task Management Dashboard (InfraEdge)

## Overview
Build a Hebrew RTL SaaS-style Task Management Dashboard in Angular (latest), with Angular Material, Signals-based state, authentication (AuthGuard + Interceptor + Proxy), and a json-server mock backend.

## Decisions
- Angular: latest (21 / whatever ng new installs)
- UI: Angular Material with custom orange theme
- State: Angular Signals
- RTL: dir="rtl" + lang="he" on <html>, Angular Material auto-adapts
- Task model: matches db.json exactly (no description field)
- Auth: client-side password check via GET /users?email=... (mock backend constraint)
- All components: standalone
- Use Declarative approch as posible
- create unit tests for services and guards

## Folder Structure
```
src/
  app/
    core/
      guards/auth.guard.ts
      interceptors/auth.interceptor.ts
      services/
        auth.service.ts
        task.service.ts
      models/
        user.model.ts
        task.model.ts
    features/
      auth/login/
        login.component.ts/html/scss
      dashboard/
        board/board.component.ts/html/scss
        task-card/task-card.component.ts/html/scss
        task-modal/task-modal.component.ts/html/scss
    app.component.ts
    app.config.ts
    app.routes.ts
  environments/environment.ts
  styles.scss
proxy.conf.json
db.json
```

## Routes
- /login → LoginComponent (public)
- / → redirect to /dashboard
- /dashboard → BoardComponent (protected by AuthGuard)

## Auth Flow
1. GET /api/users?email=... → find user
2. Compare password client-side (mock backend limitation)
3. Store {token, user} in localStorage + signal
4. Interceptor adds Authorization: Bearer <token> to all requests
5. AuthGuard: checks signal, redirects to /login if null

## Task Model
{ id?, title, status: 'todo'|'in-progress'|'done', priority: 'low'|'medium'|'high', userId }

## Signals
- AuthService: currentUser = signal<User | null>(null)
- TaskService: tasks = signal<Task[]>([]), computed filtered/grouped signals

## Theme
- Primary color: orange (~#E84C1E)
- Background: off-white cream (#FAF8F4)
- Priority badge colors: high=red-orange, medium=orange, low=yellow

## Implementation Steps

### Phase 1 — Scaffold & Config
1. ng new infraedge --standalone --routing --style=scss (adds Angular Material during setup)
2. Add db.json alongside project
3. Add json-server script to package.json: "server": "npx json-server db.json --port 3000"
4. Create proxy.conf.json: /api → http://localhost:3000 (pathRewrite ^/api → "")
5. Update angular.json serve options: proxyConfig: proxy.conf.json
6. Add environment.ts: apiUrl: '/api'

### Phase 2 — Core Layer
7. Create models: user.model.ts, task.model.ts (interfaces)
8. Create AuthService with signals + localStorage persistence
9. Create TaskService with signals + HTTP CRUD methods
10. Create AuthInterceptor (functional): adds Bearer token from AuthService
11. Create AuthGuard (functional): redirects to /login if not authenticated
12. Wire interceptor + guard in app.config.ts (provideHttpClient with interceptors)

### Phase 3 — Features
13. LoginComponent: split-layout form, Material form fields, RTL, Hebrew labels
14. BoardComponent: 3-column kanban, search bar, priority filter buttons, "משימה חדשה" button
15. TaskCardComponent: title, priority badge, status dropdown, delete button
16. TaskModalComponent: MatDialog with title input, status select, priority toggle

### Phase 4 — Styling & RTL
17. Set dir="rtl" lang="he" in index.html
18. Configure Angular Material custom theme (orange palette) in styles.scss
19. Component-level SCSS for card borders, priority badges, column layout
20. Responsive layout polish

## Verification
1. Run json-server: npm run server → verify API at localhost:3000
2. Run app: ng serve → verify proxy routes /api/* to localhost:3000
3. Login with alice@example.com / alice123 → redirects to /dashboard
4. Unauthenticated access to /dashboard → redirects to /login
5. Tasks load for logged-in user (GET /api/tasks?userId=1)
6. Create task → POST /api/tasks → card appears in correct column
7. Change status dropdown → PATCH /api/tasks/:id → card moves to new column
8. Delete task → DELETE /api/tasks/:id → card removed
9. Search filters cards by title text
10. Priority filter buttons filter cards by priority
11. Logout clears localStorage and redirects to /login
