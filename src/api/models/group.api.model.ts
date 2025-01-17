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
