# GitHub User Search

A React application for searching GitHub users and browsing their repositories.

## Tech Stack

- Frontend: React 19, TypeScript 5.7, Vite 6
- Styling: Panda CSS, Park UI, Ark UI
- Testing: Vitest, Testing Library, Playwright
- PWA: Service Workers, Workbox
- Code Quality: OxLint (for speed, not compatible with prod), Prettier, React Compiler
- CI/CD: Github Actions & Pages

## Installation

```bash
cp  .env.example .env.local # no need configuring, but Sentry DSN and GitHub token welcomed
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

## Scripts

- `npm run dev` — start development server
- `npm run build` — build for production
- `npm run preview` — preview production build
- `npm run lint` — lint code with OxLint
- `npm run format` — format code with Prettier
- `npm run test` — run unit tests
- `npm run test:watch` — run tests in watch mode
- `npm run test:coverage` — run tests with coverage
- `npm run test:e2e` — run E2E tests with Playwright
- `npm run test:e2e:coverage` — run E2E tests with code coverage

## Testing

### Unit Tests

```bash
npm run test
npm run test:coverage
```

### E2E Tests

```bash
npm run test:e2e
npm run test:e2e:coverage
```

## CI/CD

GitHub Actions pipeline runs lint, build, tests, and deploys to GitHub Pages.

## Showcase Your Skills:

> Use this project as an opportunity to demonstrate your best work, whether it's in UI/UX, state management, testing, or code architecture.

Thank you for the opportunity!

Here we have:

- React 19 + Compiler for performance
- Zero runtime CSS-in-JS, Defensive CSS, dark mode, animations
- Lazy loading
- handwritten (!) API types generation (openapi gen exists, but whole Github spec create ton of a code and there is no easy way to ask for a specific types)
- LRU cache with TTL for API response caching with automatic invalidation via localStorage.
- Offline support via PWA with Service Workers
- React hooks only state management with ease
- List virtualization with react-virtuoso for efficient rendering of large lists. Statistically, most of GitHub users has less than 5 repos, so it's optional and lazy-loaded.
- Retry with exponential backoff for automatic retries on network failures
- Keyboard navigation with full keyboard support (↑↓ navigation, Enter, Esc)
- Logger, Sentry integration, web-vitals integration
- Both unit tests and E2E tests
- Classic architecture with api/ hooks/ lib/ separation
- CSP and SEO meta tags
