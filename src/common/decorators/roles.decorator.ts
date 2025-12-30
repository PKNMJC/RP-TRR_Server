import { SetMetadata } from '@nestjs/common';

export type RoleType = 'super_admin' | 'admin' | 'viewer';

export const Roles = (...roles: RoleType[]) => SetMetadata('roles', roles);
