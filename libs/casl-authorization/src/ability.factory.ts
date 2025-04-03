import { Injectable } from '@nestjs/common';
import { Ability, AbilityBuilder, AbilityClass, ExtractSubjectType } from '@casl/ability';
import { CaslActionEnum } from './enums';



export type Subjects = string | 'all';
export type AppAbility = Ability<[CaslActionEnum, Subjects]>;

@Injectable()
export class AbilityFactory {
  createForPermissions(permissions: { action: CaslActionEnum; subject: string }[]): AppAbility {
    const { can, cannot, build } = new AbilityBuilder<Ability<[CaslActionEnum, Subjects]>>(Ability as AbilityClass<AppAbility>);

    permissions.forEach(permission => {
      can(permission.action as CaslActionEnum, permission.subject as Subjects);
    });

    return build({
        detectSubjectType: (item) => (item as any)?.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
