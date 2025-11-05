export interface CreateGroupPayload {
  group: {
    name: string;
    resource_type: string;
  };
}

export interface GroupResponse {
  id: string;
  name: string;
  resource_type: string;
  created_at: string;
  updated_at: string;
}

export interface AddResourcesToGroupPayload {
  resource_ids: string[];
  group_id: string;
}

export interface UpdateGroupPayload {
  group: {
    name: string;
  };
}

export interface GroupListResponse {
  data: GroupResponse[];
  metadata: {
    page: number;
    per_page: number;
    total_pages: number;
    data_count: number;
  };
}

export interface GetAllGroupsOptions {
  resourceType?: string;
  page?: number;
  perPage?: number;
}
