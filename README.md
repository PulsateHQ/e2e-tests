# Smokesignals End-to-End Tests

This directory contains end-to-end tests for the Smokesignals project. Smokesignals is a [brief description of the project]. The tests cover [brief explanation of what the tests cover]. They are implemented using Playwright, a framework for browser automation. More information about Playwright can be found [here](https://playwright.dev/docs/intro#installing-playwright).

## Prerequisites

Follow up frontend directory set up in order to intall Node.

## Getting Started

To run the tests, open a terminal and follow these steps:

1. Navigate to the e2e directory:

   ```bash
   cd e2e-tests
   ```

2. Install the dependencies:

   ```bash
   yarn install
   ```

3. Run the tests:
   ```bash
   yarn test
   ```
4. To run the tests in headless mode:
   ```bash
   yarn test:headless
   ```
5. To run typescript tests:
   ```bash
   yarn test:ts
   ```
6. To run the tests in headless mode:
   ```bash
   npx playwright test --ui
   ```
7. To run the tests in headless mode:
   ```bash
   npx playwright codegen https://controltiger.furiousapi.com/admins/sign_in
   ```

npm install dotenv

run tests without browser GUI
npx playwright test
run tests with browser GUI
npx playwright test --headed

view report
npx playwright show-report
