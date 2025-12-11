export enum USER_ROLES  {
    SUPER_ADMIN = '0',
    ADMIN = '1',
    USER = '2',
    SUPE_OPS = '3',
}


export type USER_STATUS = 'active' | 'inactive' | 'suspended';

export const USER_ROLES_ARRAY = Object.values(USER_ROLES);