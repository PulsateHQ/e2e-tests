import { Headers } from '@_src/api/models/headers.model';

/**
 * Creates standard authentication headers for API requests
 * @param authToken - The authentication token
 * @param options - Optional configuration: accept header (defaults to 'application/json') and contentType (only set if provided and not for multipart)
 * @returns Headers object with Authorization and Accept headers, optionally with Content-Type
 */
export function createAuthHeaders(
  authToken: string,
  options?: {
    accept?: string;
    contentType?: string;
  }
): Headers;
/**
 * Creates standard authentication headers for API requests (legacy overload for backward compatibility)
 * @param authToken - The authentication token
 * @param contentType - Optional content type (defaults to 'application/json' if not provided)
 * @returns Headers object with Authorization and Accept headers, optionally with Content-Type
 */
export function createAuthHeaders(
  authToken: string,
  contentType?: string
): Headers;
export function createAuthHeaders(
  authToken: string,
  optionsOrContentType?: string | { accept?: string; contentType?: string }
): Headers {
  const headers: Headers = {
    Authorization: `Token token=${authToken}`
  };

  // Handle both legacy string parameter and new options object
  if (typeof optionsOrContentType === 'string') {
    // Legacy: second parameter is contentType string
    headers.Accept = 'application/json';
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    optionsOrContentType && (headers['Content-Type'] = optionsOrContentType);
  } else {
    // New: options object
    headers.Accept = optionsOrContentType?.accept || 'application/json';
    // Only set Content-Type if explicitly provided (skip for multipart requests)
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    optionsOrContentType?.contentType &&
      (headers['Content-Type'] = optionsOrContentType.contentType);
  }

  return headers;
}

/**
 * Creates standard authentication headers with JSON content type
 * @param authToken - The authentication token
 * @returns Headers object with Authorization, Accept, and Content-Type headers
 */
export function createAuthHeadersWithJson(authToken: string): Headers {
  return createAuthHeaders(authToken, 'application/json');
}

/**
 * Creates super admin headers using Cookie authentication
 * @param authToken - The super admin authentication token
 * @param contentType - Optional content type (defaults to 'application/json' if not provided)
 * @returns Headers object with Cookie, Accept, and optionally Content-Type headers
 */
export function createSuperAdminHeaders(
  authToken: string,
  contentType?: string
): Headers {
  const headers: Headers = {
    Cookie: `super_admin_token=${authToken}`,
    Accept: 'application/json'
  };

  // Add Content-Type if specified
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  contentType && (headers['Content-Type'] = contentType);

  return headers;
}

/**
 * Creates super admin headers with JSON content type
 * @param authToken - The super admin authentication token
 * @returns Headers object with Cookie, Accept, and Content-Type headers
 */
export function createSuperAdminHeadersWithJson(authToken: string): Headers {
  return createSuperAdminHeaders(authToken, 'application/json');
}

/**
 * Creates Web SDK headers with x-key authentication
 * @param sdkAppId - The SDK app ID
 * @param sdkAppKey - The SDK app key
 * @returns Headers object with x-key, Accept, Content-Type, and source headers
 */
export function createWebSdkHeaders(
  sdkAppId: string,
  sdkAppKey: string
): Headers {
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'x-key': `${sdkAppId}${sdkAppKey}`,
    source: 'native'
  };
}
