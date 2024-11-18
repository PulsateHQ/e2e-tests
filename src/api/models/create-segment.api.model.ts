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
