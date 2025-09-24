# Flaky Test Report

**Generated:** 1/15/2025, 10:30:00 AM
**Run ID:** 123456789

## Summary

- **Total Tests Analyzed:** 45
- **Flaky Tests Detected:** 3
- **Flaky Rate:** 6.7%
- **Quarantine Candidates:** 1

### Severity Breakdown

- 🔴 **High:** 1
- 🟡 **Medium:** 1
- 🟢 **Low:** 1

## 🚨 Quarantine Candidates

The following tests should be considered for quarantine due to high failure rates or instability:

#### should create campaign successfully

**File:** `tests/api/campaign.feed.api.spec.ts`
**Owner:** campaigns-team
**Severity:** 🔴 high
**Failure Rate:** 40.0% (4/10 runs)
**Detection:** historical
**Avg Retries:** 1.2
**Last Seen:** 1/15/2025

**Recommendations:**
- Review test data setup and cleanup
- Consider breaking into smaller, more focused tests
- Check for external dependencies or async operations

> ⚠️ **QUARANTINE CANDIDATE**: This test should be tagged with `@flaky` and moved to quarantine suite.

---

## 🔍 All Flaky Tests

### 🔴 High Severity

#### should create campaign successfully

**File:** `tests/api/campaign.feed.api.spec.ts`
**Owner:** campaigns-team
**Severity:** 🔴 high
**Failure Rate:** 40.0% (4/10 runs)
**Detection:** historical
**Avg Retries:** 1.2
**Last Seen:** 1/15/2025

**Recommendations:**
- Review test data setup and cleanup
- Consider breaking into smaller, more focused tests
- Check for external dependencies or async operations

---

### 🟡 Medium Severity

#### should login with valid credentials

**File:** `tests/ui/login.ui.spec.ts`
**Owner:** frontend-team
**Severity:** 🟡 medium
**Detection:** immediate
**Last Seen:** 1/15/2025

**Latest Error:**
```
Timeout 30000ms exceeded waiting for element to be visible
```

**Recommendations:**
- Add explicit waits or improve element selectors
- Investigate timing issues and race conditions

---

### 🟢 Low Severity

#### should update user attributes

**File:** `tests/api/users.api.spec.ts`
**Owner:** users-team
**Severity:** 🟢 low
**Failure Rate:** 25.0% (2/8 runs)
**Detection:** historical
**Avg Retries:** 0.5
**Last Seen:** 1/14/2025

**Recommendations:**
- Review test environment stability

---

## 💡 General Recommendations

1. **Immediate Actions:**
   - Review and fix high-severity flaky tests first
   - Consider quarantining tests with >40% failure rate
   - Add `@flaky` tags to identified tests

2. **Long-term Improvements:**
   - Implement better wait strategies and element selectors
   - Review test data management and cleanup processes
   - Consider test environment stability improvements
   - Add monitoring for test execution patterns

3. **Team Assignments:**
   - **campaigns-team:** 1 flaky tests
   - **frontend-team:** 1 flaky tests
   - **users-team:** 1 flaky tests

