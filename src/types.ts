export interface AuthUser {
  id: number;
  email: string;
}

export type AppBindings = {
  Variables: {
    user: AuthUser;
  };
};
