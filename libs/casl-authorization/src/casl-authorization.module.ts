import { Module } from '@nestjs/common';
import { CaslAuthorizationService } from './casl-authorization.service';
import { AbilityFactory } from './ability.factory';

@Module({
  providers: [CaslAuthorizationService, AbilityFactory],
  exports: [CaslAuthorizationService, AbilityFactory],
})
export class CaslAuthorizationModule {}
