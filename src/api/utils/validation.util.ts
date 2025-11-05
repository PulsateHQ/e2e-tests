import { expect } from '@_src/ui/fixtures/merge.fixture';

/**
 * Validates that a list response has the expected structure with data array and metadata
 * @param responseJson - The parsed JSON response to validate
 * @param metadataFields - Optional array of metadata fields to validate
 */
export function validateListResponseStructure<T>(
  responseJson: T,
  metadataFields?: Array<keyof T>
): void {
  expect(responseJson).toHaveProperty('data');
  expect(Array.isArray((responseJson as { data: unknown[] }).data)).toBe(true);
  expect(responseJson).toHaveProperty('metadata');

  if (metadataFields) {
    const metadata = (responseJson as { metadata: Record<string, unknown> })
      .metadata;
    for (const field of metadataFields) {
      expect(metadata).toHaveProperty(field as string);
    }
  }
}

/**
 * Validates common metadata structure found in list responses
 * @param metadata - The metadata object to validate
 */
export function validateCommonMetadata(metadata: {
  page?: number;
  per_page?: number;
  total_pages?: number;
  data_count?: number;
}): void {
  if (metadata.page !== undefined) {
    expect(typeof metadata.page).toBe('number');
  }
  if (metadata.per_page !== undefined) {
    expect(typeof metadata.per_page).toBe('number');
  }
  if (metadata.total_pages !== undefined) {
    expect(typeof metadata.total_pages).toBe('number');
  }
  if (metadata.data_count !== undefined) {
    expect(typeof metadata.data_count).toBe('number');
  }
}

/**
 * Validates that a resource response has required identification fields
 * @param responseJson - The parsed JSON response to validate
 * @param requiredFields - Array of required field names
 */
export function validateResourceResponse(
  responseJson: Record<string, unknown>,
  requiredFields: string[]
): void {
  for (const field of requiredFields) {
    expect(responseJson).toHaveProperty(field);
  }
}
