export interface GeofencePayload {
  radius: string;
  location: [number, number];
  shape: 'circle' | 'polygon';
  id: string;
  error: Record<string, unknown>;
  groups: string[];
  is_draggable: boolean;
  is_editable: boolean;
  name: string;
}

export interface UpdateGeofencePayload {
  id: string;
  name: string;
  guid: string;
  groups: string[];
  location: [number, number];
  type: 'enter' | 'exit';
  shape: 'circle' | 'polygon';
  radius: string;
  created_at: string;
  updated_at: string;
  radius_unit: 'feet' | 'meters';
  error: null | Record<string, unknown>;
  is_draggable: boolean;
  is_editable: boolean;
}

export interface BatchDestroyGeofencePayload {
  resource_ids: string[];
}

export interface GeofenceResponse {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  guid: string;
  groups: string[];
  location: [number, number];
  type: 'enter' | 'exit';
  shape: 'circle' | 'polygon';
  radius: number;
  radius_unit: 'feet' | 'meters';
  is_draggable: boolean;
  is_editable: boolean;
}

export interface GeofenceBulkActions {
  delete: string;
  add_to_group: string;
  remove_from_group: string;
}

export interface GeofenceMetadata {
  page: number;
  per_page: number;
  total_pages: number;
  data_count: number;
  groups: string[];
  location: [number, number];
  min_radius: number;
  max_radius: number;
  export_link: string;
}

export interface GeofenceListResponse {
  data: GeofenceResponse[];
  bulk_actions: GeofenceBulkActions;
  metadata: GeofenceMetadata;
}
