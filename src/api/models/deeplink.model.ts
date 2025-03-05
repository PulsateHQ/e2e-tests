/**
 * Interface representing a deeplink request body
 */
export interface DeeplinkPayload {
  /**
   * A descriptive name for the deeplink
   */
  nickname: string;

  /**
   * The target URL that the deeplink will navigate to
   */
  target: string;
}

/**
 * Interface representing a deeplink response from the API
 */
export interface DeeplinkResponse extends DeeplinkPayload {
  /**
   * Unique identifier for the deeplink
   */
  id?: string;

  /**
   * ISO timestamp when the deeplink was created
   */
  created_at?: string;

  /**
   * ISO timestamp when the deeplink was last updated
   */
  updated_at?: string;
}
