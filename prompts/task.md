# Plan mode prompt

```
I want you to act as a lead engineer responsible for hiring. You'll review a test task submitted by a candidate: a GitHub profile search app written in React and TypeScript.

Your task is to meticulously and systematically examine each project file: architecture, component logic, API workflow, state management, typing, error handling, security, performance, and code readability. For each file, you must identify all vulnerabilities, potential issues, anti-patterns, and risks, as well as strengths, successful solutions, and signs of engineering maturity.

After the analysis, you will deliver a detailed professional verdict, including:

- an overall assessment of the candidate's level;

- implementation strengths and weaknesses;

- issues that are critical for production;

- recommendations for improvement;

- a conclusion on whether to invite the candidate to the next stage and at what level (junior, middle, or senior).

The tone of the response is strict, technical, and objective, just like during a real internal code review at a large IT company.
```

---

# Result of plan mode (Task prepared for research and coding agents)

__All of the content below IS AI GENERATED.__


---

**Act as a senior Frontend Engineer responsible for hiring decisions.**
You are reviewing a take-home assignment submitted for a **Frontend Engineer** position.
Your task is to perform a **systematic, file-by-file code review** and produce a **final hiring verdict**.

You must evaluate the solution strictly against the provided requirements and professional frontend engineering standards.

---

## Context

This is a take-home assignment for a Frontend Engineer role.
The goal is not just to verify functionality, but to assess **engineering maturity, architectural thinking, and production readiness**.

You are expected to analyze **every file listed below** and provide a structured assessment, followed by a final hiring decision.

---

## Requirements (from `./requirements.pdf`)

Read requirements from attached pdf.

## Review Plan (File-by-File)

### Phase 1: Core Architecture

1. `src/App.tsx` — application root and structure
2. `src/main.tsx` — entry point and initialization
3. `src/lib/config.ts` — application configuration

### Phase 2: API Layer

4. `src/api/github.ts` — GitHub API client
5. `src/api/github.test.ts` — API tests
6. `src/types/github.ts` + `github.generated.ts` — domain types

### Phase 3: Hooks

7. `src/hooks/useGitHubSearch.ts` — core search logic
8. `src/hooks/useKeyboardNav.ts` — keyboard navigation
9. `src/hooks/useSearchHistory.ts` — search history
10. `src/hooks/useClipboard.ts` — clipboard interactions
11. `src/hooks/useOnlineStatus.ts` — offline detection

### Phase 4: Components

13. `src/components/SearchForm.tsx`
14. `src/components/UserAccordion.tsx`
15. `src/components/RepoList.tsx`
16. `src/components/VirtualizedRepoList.tsx`
17. `src/components/RepoItem.tsx`
18. `src/components/Skeleton.tsx`
19. `src/components/ErrorBoundary.tsx` + `ApiErrorBoundary.tsx`
20. `src/components/Header.tsx`, `Footer.tsx`, `ThemeToggle.tsx`
21. `src/components/SearchHistory.tsx`, `KeyboardHints.tsx`
22. `src/components/icons/index.tsx`

### Phase 5: Utilities

23. `src/lib/cache.ts` — caching strategy
24. `src/lib/retry.ts` — retry logic
25. `src/lib/logger.ts` — logging
26. `src/lib/searchParams.ts` — URL state
27. `src/lib/sentry.ts` — error tracking

### Phase 6: Configuration & Build

28. `vite.config.ts`
29. `tsconfig.json`
30. `panda.config.ts`
31. `vitest.config.ts`
32. `playwright.config.ts`
33. `.github/workflows/ci.yml`

### Phase 7: Tests Review

34. Unit and integration tests (hooks, libs, components)
35. E2E tests (accessibility, responsive behavior, user flows)

### Phase 8: Browser Testing (if available)

36. Visual UI review at `localhost:5173` using Claude Chtome Extension MCP
37. Responsive behavior
38. Keyboard navigation
39. Error and edge states

---

## Evaluation Criteria

### 1. Architecture & Design

* Project structure
* Separation of concerns
* Scalability
* Justification of abstractions

### 2. React & UI Logic

* Component architecture
* State management
* Render control
* Composition vs duplication
* Accessibility, UX, responsiveness

### 3. API Handling

* Correct GitHub API usage
* Error handling
* Request cancellation & race conditions
* Caching strategy

### 4. TypeScript Quality

* Type precision
* Usage of `any`, `unknown`, casts
* API response typing
* Type-level safety

### 5. Code Quality

* Readability
* Naming
* Best practices
* Anti-patterns

### 6. Performance

* Bottlenecks
* Unnecessary re-renders
* Inefficient computations
* List rendering and async behavior

### 7. Security & Edge Cases

* Vulnerabilities
* Handling of external data
* Edge-case coverage

---

## Report Format

### For each file:

* Purpose
* ❌ Issues, risks, anti-patterns
* ⚠️ Questionable or debatable choices
* ✅ Strengths

### Final Verdict:

1. Estimated seniority level
2. Key strengths
3. Weaknesses and red flags
4. Critical issues
5. Improvement recommendations
6. **Hiring decision**

---

## Review Execution Steps

1. Read and analyze every file listed above
2. Evaluate against the defined criteria
3. Review tests and coverage in detail
4. Inspect bundle composition (via ./.sonda)
5. Perform browser testing if MCP access is available
6. Produce a detailed written report with a final verdict
