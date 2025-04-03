### @bune/casl-authorization

A lightweight and flexible authorization package for NestJS using CASL (Content Access Security Layer). This package helps implement role-based access control (RBAC) and fine-grained permissions in GraphQL microservices.

---

## Installation  

```bash
npm install @bune/casl-authorization
```

---

## Usage  

### 1️⃣ Define Permissions  

Create an `ability.factory.ts` file to define rules for different roles and permissions.  

```typescript
import { Ability, AbilityBuilder, AbilityClass, ExtractSubjectType } from '@casl/ability';

export enum CaslActionEnum {
  Manage = 'manage',
  Read = 'read',
  Create = 'create',
  Update = 'update',
  Delete = 'delete',
}

export type Subjects = 'User' | 'Post' | 'Comment' | 'all';

export type AppAbility = Ability<[CaslActionEnum, Subjects]>;

export class AbilityFactory {
  createForPermissions(permissions: { action: CaslActionEnum; subject: Subjects }[]): AppAbility {
    const { can, build } = new AbilityBuilder<Ability<[CaslActionEnum, Subjects]>>(Ability as AbilityClass<AppAbility>);

    permissions.forEach(({ action, subject }) => can(action, subject));

    return build({
      detectSubjectType: (item) => item as ExtractSubjectType<Subjects>,
    });
  }
}
```

---

### 2️⃣ Apply Guard in GraphQL Resolvers  

Use `CaslGuard` to check permissions before executing a GraphQL query or mutation.  

```typescript
import { Resolver, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CaslGuard } from '@bune/casl-authorization';

@Resolver()
export class SampleResolver {
  @Query(() => String)
  @UseGuards(CaslGuard)
  hello(): string {
    return 'Hello, authorized user!';
  }
}
```

---

### 3️⃣ Use Custom Decorator for Permission Checks  

Define a `@CheckPermissions()` decorator to apply permission rules dynamically.  

```typescript
import { SetMetadata } from '@nestjs/common';
import { CaslActionEnum, Subjects } from './ability.factory';

export const CHECK_PERMISSIONS = 'check_permissions';
export const CheckPermissions = (action: CaslActionEnum, subject: Subjects) =>
  SetMetadata(CHECK_PERMISSIONS, { action, subject });
```

Then apply it to a resolver method:  

```typescript
@Query(() => String)
@CheckPermissions(CaslActionEnum.Read, 'User')
@UseGuards(CaslGuard)
getUser(): string {
  return 'Authorized user data';
}
```

---

## License  

**MIT License**

