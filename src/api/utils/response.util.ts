import { expect } from '@_src/ui/fixtures/merge.fixture';
import { APIResponse } from '@playwright/test';

/**
 * Validates that the API response has the expected status code
 * @param response - The API response to validate
 * @param expectedStatus - The expected HTTP status code
 * @throws Error if status code doesn't match
 */
export function validateStatusCode(
  response: APIResponse,
  expectedStatus: number
): void {
  expect(
    response.status(),
    `Expected status: ${expectedStatus} and observed: ${response.status()}`
  ).toBe(expectedStatus);
}

/**
 * Parses a JSON response with type safety
 * @param response - The API response to parse
 * @returns Parsed JSON response as the specified type
 */
export async function parseJsonResponse<T>(response: APIResponse): Promise<T> {
  return (await response.json()) as T;
}

/**
 * Parses a plain text response
 * @param response - The API response to parse
 * @returns The response body as a string
 */
export async function parseTextResponse(response: APIResponse): Promise<string> {
  return await response.text();
}

