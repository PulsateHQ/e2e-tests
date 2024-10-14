# E2E Tests for CMS

This project contains end-to-end tests for the CMS project, implemented using Playwright, a powerful framework for browser automation.

## Prerequisites

- Node.js (version not specified, please ensure you have a compatible version installed)
- npm (comes with Node.js)

## Installation

1. Clone the repository (if not already done)
2. Navigate to the project directory:
   ```bash
   cd e2e-tests
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```

## Running Tests

This project supports running tests in various modes and environments. Here are the available commands:

### General Test Commands

- Run all tests: `npm run test`
- Run tests with browser GUI: `npm run test:headed`
- Run tests with Playwright UI: `npm run test:ui`
- View test report: `npm run show-report`

### Environment-Specific Test Commands

Replace `<env>` with one of: leopard, puma, jaguar, sealion, bear, tiger, whale, or local.

- Run tests for a specific environment with UI:
  ```bash
  npm run test:<env>
  ```
- Run tests for a specific environment in headed mode:
  ```bash
  npm run test:<env>:headed
  ```
- Run tests for a specific environment in headless mode:
  ```bash
  npm run test:<env>:headless
  ```

## Additional Commands

- Format code: `npm run format`
- Check code formatting: `npm run format:check`
- Lint code: `npm run lint`

## Generating Test Code

To generate test code based on your interactions with a web page:

```bash
npx playwright codegen https://your-target-url.com
```

Replace `https://your-target-url.com` with the URL you want to test.

## Project Structure

- `tests/`: Contains the test files
- `playwright.config.ts`: Playwright configuration file
- `.env.<environment>`: Environment-specific configuration files

## Dependencies

- Playwright: v1.47.1
- TypeScript: v5.6.2
- Prettier: v3.3.3
- ESLint: (version not specified, included in scripts)
- dotenv: v16.4.5

For a complete list of dependencies and their versions, please refer to the `package.json` file.
.
