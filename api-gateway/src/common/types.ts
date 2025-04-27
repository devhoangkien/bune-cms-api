export type Permission = {
    __typename: string;
    action: string;
    id: string;
    key: string;
    name: string;
    resource: string;
    status: string;
  };
  
 export type Role = {
    __typename: string;
    id: string;
    key: string;
    name: string;
    permissions: Permission[];
  };
  
export  type RolesData = {
    getRolesByKeys: Role[];
  };
  