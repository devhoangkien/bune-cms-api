import { SetMetadata } from '@nestjs/common';
import { CaslActionEnum } from './enums';

export const CHECK_PERMISSIONS = 'check_permissions';

export const CheckPermissions = (action: CaslActionEnum, subject: string) => 
  SetMetadata(CHECK_PERMISSIONS, { action, subject });
