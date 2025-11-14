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
export async function parseTextResponse(
  response: APIResponse
): Promise<string> {
  return await response.text();
}

/**
 * Validates status code and parses JSON response in one operation
 * @param response - The API response to validate and parse
 * @param expectedStatus - The expected HTTP status code (defaults to 200)
 * @returns Parsed JSON response as the specified type
 */
export async function validateAndParseJson<T>(
  response: APIResponse,
  expectedStatus: number = 200
): Promise<T> {
  validateStatusCode(response, expectedStatus);
  return parseJsonResponse<T>(response);
}

/**
 * Validates that response has specific properties
 * @param response - The parsed response object
 * @param properties - Array of property names that should exist
 * @throws Error if any property is missing
 */
export function validateResponseProperties(
  response: unknown,
  properties: string[]
): void {
  properties.forEach((prop) => {
    expect(response).toHaveProperty(prop);
  });
}

/**
 * Validates status code, parses JSON, and checks for required properties
 * @param response - The API response to validate
 * @param expectedStatus - The expected HTTP status code (defaults to 200)
 * @param requiredProperties - Optional array of property names that should exist
 * @returns Parsed JSON response as the specified type
 */
export async function validateAndParseJsonWithProperties<T>(
  response: APIResponse,
  expectedStatus: number = 200,
  requiredProperties?: string[]
): Promise<T> {
  const parsedResponse = await validateAndParseJson<T>(
    response,
    expectedStatus
  );

  if (requiredProperties && requiredProperties.length > 0) {
    validateResponseProperties(parsedResponse, requiredProperties);
  }

  return parsedResponse;
}
