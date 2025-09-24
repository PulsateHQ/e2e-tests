# E2E Tests for CMS

This project contains end-to-end tests for the CMS project, implemented using Playwright, a powerful framework for browser automation.

## Features

- **API Testing**: Comprehensive API endpoint testing with proper authentication and data validation
- **UI Testing**: User interface testing for web applications
- **Health Check Monitoring**: Automated health check smoke tests to ensure API availability
- **Test Data Management**: Sophisticated test data generation with faker.js for realistic testing scenarios
- **Reporting**: Allure reports for detailed test results and analytics
- **CI/CD Integration**: GitHub Actions workflow with Slack notifications and PR status updates

## Health Check Smoke Tests

The project includes automated health check smoke tests that run before the main E2E test suite to ensure the API is available and responding correctly.

### Health Check Endpoint

- **URL**: `GET /api/v1/health_check`
- **Authentication**: None required (public endpoint)
- **Response**:
  - Success: `200 OK` with body `"OK"`
  - Failure: `500 Internal Server Error` with body `"INTERNAL SERVER ERROR"`

### What it Checks

The health check endpoint verifies connectivity to critical backend services:

- Cache Connection (Redis)
- MongoDB Connection
- Resque Connection (background jobs)
- Vp2Sqs Connection (queue service)

### Implementation

- **Test File**: `tests/api/health-check.smoke.spec.ts`
- **Factory**: `src/api/factories/health-check.api.factory.ts`
- **Features**:
  - Basic health check with 30-second timeout
  - Response time validation (configurable threshold)
  - Proper error handling with `expect().toPass()` pattern
  - Follows project's existing API factory patterns

### CI/CD Workflow

1. **Health Check Job**: Runs first to verify API availability (3-minute timeout)
2. **Setup Dependencies**: Caches and installs dependencies (only runs if health check passes)
3. **Test Execution**: Main E2E test suite
4. **Reports**: Allure report generation and S3 upload
5. **Notifications**: Slack alerts and PR status updates

### Failure Handling

- If health check fails, the entire workflow stops immediately
- Slack notification is sent with detailed failure information
- PR status is updated to reflect the health check failure
- No E2E tests are executed if the API is unhealthy
- Workflow provides clear error messages for troubleshooting

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
4. Setup husky:
   ```bash
   npx husky
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

### Core Testing Framework

- **Playwright**: v1.47.1 - Browser automation and testing framework
- **TypeScript**: v5.6.2 - Type-safe JavaScript development

### Development Tools

- **Prettier**: v3.3.3 - Code formatting
- **ESLint**: Code linting and quality checks
- **Husky**: Git hooks for code quality enforcement

### Utilities

- **dotenv**: v16.4.5 - Environment variable management
- **@faker-js/faker**: Test data generation
- **Allure**: Test reporting and analytics

### CI/CD Dependencies

- **GitHub Actions**: Workflow automation
- **AWS CLI**: S3 bucket operations for report storage
- **Slack Integration**: Notification system

For a complete list of dependencies and their versions, please refer to the `package.json` file.

## Test Structure

### API Tests (`tests/api/`)

- **Campaign Tests**: In-app campaigns, feed campaigns, geofence campaigns
- **User Management**: User creation, updates, segments
- **Admin Operations**: Admin registration, privileges, authentication
- **Health Checks**: API availability and response time validation

### Test Data Management

- **Factories**: Reusable test data generators in `src/api/factories/`
- **Payloads**: Test data templates in `src/api/test-data/`
- **Models**: TypeScript interfaces for API responses

### Best Practices

- **Test Independence**: Each test generates fresh data to avoid conflicts
- **Function-based Payloads**: All test data generators are functions returning fresh instances
- **Proper Cleanup**: Tests clean up after themselves using `beforeEach` and `afterEach` hooks
- **Comprehensive Validation**: Both happy path and error scenarios are tested
- **Consistent Patterns**: Follow established factory and API utility patterns
- **Error Handling**: Use `expect().toPass()` for retry logic and proper timeout handling
- **Type Safety**: Leverage TypeScript for compile-time error detection

## CI/CD Pipeline

### GitHub Actions Workflow

Workflows under `.github/workflows/`:

- `e2e.yml`: prepare → test (matrix: `sealion`, `leopard`, `jaguar`) → report
  - Caching via Node lockfile, Playwright browsers via action
  - Health check runs before E2E
  - Artifacts: Allure results, Playwright report JSON, traces/screenshots/videos
  - Slack: threaded start and final result using Block Kit
- `daily-digest.yml`: scheduled digest with recent flake summary

### Performance Optimizations

- **Dependency Caching**: Shared caches for `node_modules` and Playwright browsers
- **Conditional Installation**: Only installs dependencies on cache misses
- **Parallel Execution**: Jobs run in parallel where possible
- **Estimated Time Savings**: 6-9 minutes per workflow run
- **Fail-Fast**: Health check prevents unnecessary resource usage

### Slack Notifications

- **Health Check Failures**: Immediate alerts with detailed failure information
- **Test Results Summary**: Comprehensive status including health check and E2E test results
- **Rich Information**: Links to GitHub Actions run, Allure reports, and PR details
- **Status Indicators**: Clear visual indicators (✅ Passed, ❌ Failed, ⏭️ Skipped)
- **Environment Context**: Includes environment information and PR details

### PR Status Updates

- Commit status is updated with overall test results
- Context includes environment information
- Status reflects both health check and E2E test outcomes

## Reporting

### Allure Reports

- **Location**: S3 bucket with CloudFront distribution for fast global access
- **Features**:
  - Test execution history and trends
  - Environment details and configuration
  - Detailed failure analysis with screenshots
  - Performance metrics and timing information
  - Test categorization and filtering
- **Access**: Available via web interface with proper authentication
- **Automatic Generation**: Reports are automatically generated and uploaded after each test run
- **History Preservation**: Previous test history is maintained for trend analysis

### Test Results

- **Artifacts**: Stored in GitHub Actions artifacts
- **Reports**: Allure HTML reports
- **Logs**: Detailed test execution logs

## Contributing

### Adding New Tests

1. Create test file in appropriate directory
2. Use existing factories and payloads when possible
3. Follow naming conventions and structure
4. Add proper cleanup and error handling
5. Update documentation if needed

### Test Data Guidelines

- **Function-based Payloads**: Always use functions that return fresh data for each test
- **Avoid Static Objects**: Never use static objects that can be mutated between tests
- **Fresh Data Generation**: Each test should generate its own unique test data
- **Proper TypeScript Types**: Include comprehensive type definitions
- **Consistent Patterns**: Follow existing factory and payload patterns
- **Example**:

  ```typescript
  // ✅ Correct: Function-based payload
  export const createUserPayload = (): UserPayload => ({
    name: faker.person.fullName(),
    email: faker.internet.email()
  });

  // ❌ Incorrect: Static object
  export const createUserPayload = {
    name: faker.person.fullName(), // Generated once, reused
    email: faker.internet.email()
  };
  ```

### Code Quality

- Run linting: `npm run lint`
- Follow TypeScript best practices
- Use proper error handling
- Add comments for complex logic

## Troubleshooting

### Common Issues

1. **Health Check Failures**:

   - Check API service status and network connectivity
   - Verify environment variables are correctly set
   - Review health check logs in GitHub Actions for specific error details

2. **Test Data Conflicts**:

   - Ensure all payloads are function-based, not static objects
   - Verify tests use fresh data generation for each execution
   - Check that cleanup hooks are properly implemented

3. **Environment Issues**:

   - Verify environment variables and configuration
   - Check that the correct environment is selected in GitHub Actions
   - Ensure API endpoints are accessible from the test environment

4. **Timeout Errors**:

   - Check API response times and network conditions
   - Review timeout configurations in test files
   - Monitor health check response times

5. **Cache Issues**:
   - Clear GitHub Actions cache if dependencies are corrupted
   - Verify Playwright browser installation completed successfully
   - Check cache key consistency between jobs

### Debugging

- **Local Development**: Enable Playwright debug mode: `PWDEBUG=1 npx playwright test`
- **CI/CD Debugging**: Check detailed logs in GitHub Actions workflow runs
- **Test Analysis**: Review Allure reports for detailed failure information and trends
- **Browser Debugging**: Use browser developer tools for UI test debugging
- **Health Check**: Run health check tests locally to verify API connectivity
- **Dependency Issues**: Check Playwright installation and browser availability
