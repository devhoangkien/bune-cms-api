import { ValidationPipe  } from '@nestjs/common';
import { ErrorType, validateGraphqlError } from './graphql-errors';

export class GqlValidationPipe extends ValidationPipe {
  constructor() {
    super({
      exceptionFactory: (errors:any) => {
        const errorMessages = errors.map((error: any) => {
          const childrenError = error.children.map((children: any) => {
            const property = children.property;
            const dynamicKey = Object.keys(children.constraints)[0];
            const message = children.constraints[dynamicKey];

            if (children.contexts) {
              const contexts = children.contexts;
              const errorCode = contexts[dynamicKey].errorCode;
              const developerNote = contexts[dynamicKey].developerNote;

              return {
                property,
                message,
                errorCode,
                developerNote,
              };
            }

            return {
              property,
              message,
            };
          });

          return childrenError;
        });

        return validateGraphqlError(errorMessages[0] as ErrorType[]);
      },
      stopAtFirstError: true,
    });
  }
}