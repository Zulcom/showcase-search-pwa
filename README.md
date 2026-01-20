# GitHub User Search

A React application for searching GitHub users and browsing their repositories.

[Live demo on Vercel: https://showcase-search-pwa.vercel.app/](https://showcase-search-pwa.vercel.app/)

[Code](https://github.com/Zulcom/showcase-search-pwa)

Bundle before any compression:

![Bundle analyzer report](./bundle.webp)
## Tech Stack

- Frontend: React 19, TypeScript 5.7, Vite 6
- Styling: Panda CSS, Park UI, Ark UI
- Testing: Vitest, Testing Library, Playwright
- PWA: Service Workers, Workbox
- Code Quality: OxLint (for speed, not compatible with prod), Prettier, React Compiler
- CI/CD: Github Actions & Pages (Switched to Vercel since Pages are paid)

## Installation

no need configuring, but Sentry DSN and GitHub token welcomed

```bash
cp .env.example .env.local
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

> Use this project as an opportunity to demonstrate your best work, whether it's in UI/UX, state management, testing, or
> code architecture.

Thank you for the opportunity!

Here we have:

- React 19 + Compiler for performance
- Zero runtime CSS-in-JS, Defensive CSS, dark mode, animations
- Lazy loading
- handwritten (!) API types generation (openapi gen exists, but whole Github spec create ton of a code and there is no
  easy way to ask for a specific types)
- LRU cache with TTL for API response caching with automatic invalidation via localStorage.
- Offline support via PWA with Service Workers
- React hooks only state management with ease
- List virtualization with react-virtuoso for efficient rendering of large lists. Statistically, most of GitHub users
  has less than 5 repos, so it's optional and lazy-loaded.
- Retry with exponential backoff for automatic retries on network failures
- Keyboard navigation with full keyboard support (↑↓ navigation, Enter, Esc)
- Logger, Sentry integration, web-vitals integration
- Both unit tests and E2E tests
- Classic architecture with api/ hooks/ lib/ separation
- CSP and SEO meta tags

## What can be improved

- A GitHub API key is required for good UX but must be stored on the backend only (Architecture limitation).
- Usernames shorter than 3 characters [exist](https://github.com/ai) (it's discussion of API debounce trade-offs)
- For large projects state management lib is mandatory (and it's easier to test and extend)
- `AbortController` will concurrently abort other code if this lib reused by other features.
- Codegen should be done with openapi generator (Such a great opportunity to show scripting skills)
- Web-vitals shouldn't be displayed to real users and shouldn't be collected for each visitor (affects performance)
- A proper visual design with custom icons and typography instead of OSS icon sets (Lucide used).
- Improve documentation and clean up some development artifacts
- Monitoring and proper observability should be added
- Proper E2E tests for CI/CD and coverage merging (debatable)
- SSR support to allow the application to function without JavaScript (because "use a proper browser" was never a good response)

## AI Assistance disclosure

Before submitting this project, I used Claude Code with the Opus 4.5 model to eliminate obvious issues and avoid an initial round of corrective feedback.

It was initially run in Plan mode (extended context, custom system prompt) with a first prompt.
The resulting prompt with original PDF requirements was saved locally and used to review the final commit. File system was as of 0e1e5d09baf1cba196bfabd93c926d228ab69749.

- `./prompts/task.md` consists of two prompts
- `./prompts/result.txt` is full chat export

Result of analysis here: `prompts/result.txt:286`

The PDF requirements (received via email and not included in the repository) was sanitized prior to being allowed to read by model: Trademarks were removed, and wording was changed without altering the original meaning.
