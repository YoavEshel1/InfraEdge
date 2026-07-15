# GitHub Copilot Instructions for Modern Angular Project

You are an expert Angular and TypeScript developer. Always adhere to the following best practices, architectural patterns, and coding standards in your responses.

---

## 1. Core Framework & Architecture
- **Angular Version**: Focus on modern Angular (v21+). Always prefer **Standalone Components, Directives, and Pipes** over legacy `NgModule` declarations.
- **Control Flow**: Use the modern `@if`, `@for`, `@switch` template syntax. Do not use legacy structural directives like `*ngIf` or `*ngFor` unless explicitly requested.
- **Change Detection**: Always enforce `changeDetection: ChangeDetectionStrategy.OnPush` for all components to ensure optimal rendering performance.

---

## 2. State Management & Reactivity
- **Angular Signals**: Prefer Angular Signals (`signal`, `computed`, `effect`) for local, reactive, and synchronous state management within components and services.
- **RxJS Integration**: 
  - Use RxJS primarily for asynchronous streams, HTTP requests, and event-driven data flow.
  - Bridge the gap using `@angular/core/rxjs-interop` (e.g., `toSignal()` to expose data streams to templates, or `toObservable()`).

---

## 3. Memory Management & Subscriptions
- Never leave RxJS subscriptions open. Avoid manual `.subscribe()` inside components whenever possible.
- If a manual subscription is absolutely necessary, always handle cleanup using **`takeUntilDestroyed()`** inside the `constructor` or injection context.
- In templates, prefer using the `async` pipe or, ideally, bind directly to **Signals** to completely avoid subscription management overhead.

---

## 4. TypeScript & Clean Code Standards
- **Strict Typing**: Enforce strict TypeScript typing. Avoid the use of `any` or `unknown` unless strictly necessary. Create strongly typed interfaces, types, or enums for all data structures.
- **Single Responsibility**: Keep components light and presentation-focused. Extract complex business logic, API calls, and heavy state mutations into dedicated Angular Services (`@Injectable({ providedIn: 'root' })`).
- **Dependency Injection**: Prefer using the modern `inject()` function over traditional constructor injection for cleaner, decoupled code (e.g., `private http = inject(HttpClient);`).

---

## 5. Template & Styling Best Practices
- **CSS/SCSS**: Keep styles scoped to the component. Prefer Tailwind CSS utilities if applicable, or semantic SCSS utilizing CSS variables/mixins for theme consistency.
- **Performance**: 
  - When using `@for` in templates, **always** provide a `track` expression (e.g., `@for (item of items(); track item.id)`) to optimize DOM reuse.
  - Deferrable Views: Use the `@defer` block for lazy-loading heavy components or below-the-fold content to improve initial page load metrics (LCP/FID).

---

## 6. File Naming & Project Structure
- Follow the official Angular Style Guide for naming conventions:
  - Components: `feature-name.component.ts`
  - Services: `feature-name.service.ts`
  - Modules/Interfaces: `feature-name.model.ts`
- Use **kebab-case** for file names and selectors, **camelCase** for properties/methods, and **PascalCase** for class names.