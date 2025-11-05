export interface SegmentRule {
  type: string;
  match_type: string;
  match_value: string;
}

export interface SegmentGroup {
  join_type: string;
  rules: SegmentRule[];
}

export interface CreateSegmentPayload {
  name: string;
  groups: SegmentGroup[];
}

export interface SegmentResponse {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  groups: SegmentGroup[];
  custom_tag?: string;
  groups_ids?: string[];
}

export interface SegmentListResponse {
  data: SegmentResponse[];
  bulk_actions: unknown;
  metadata: {
    page: number;
    per_page: number;
    total_pages: number;
    data_count: number;
  };
}

export interface SegmentUsersResponse {
  data: Array<{
    id: string;
    alias: string;
    [key: string]: unknown;
  }>;
  metadata: {
    page: number;
    per_page: number;
    total_pages: number;
    data_count: number;
  };
}

export interface SegmentTotalAudienceResponse {
  total_audience: number;
}
