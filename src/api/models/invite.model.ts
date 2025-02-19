export interface InviteAdminRequest {
  email: string;
  role: string;
  managed_app_id: string;
  allowed_actions: 'all';
  skip_invinte_mail: boolean;
}

export interface InviteAdminResponse {
  admin: {
    id: string;
    access: string;
    actions: {
      delete: boolean;
      edit: boolean;
    };
    avatar_url: string;
    email: string;
    role: 'app_admin';
    invite_token: string;
    job_title: string | null;
    managed_app: null | {
      name: string | null;
      id: string;
    };
    name: string | null;
    username: string | null;
    created_at: string;
    updated_at: string;
  };
  message: string;
}

export type AdminRole = 'master_admin' | 'app_admin';
export type AllowedActions = 'all' | 'read' | 'write';
