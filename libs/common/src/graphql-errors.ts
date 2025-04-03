import { GraphQLError } from 'graphql';

export function createGraphQLError(
  status: number,
  message: string,
  messageCode: string,
): GraphQLError {
  return new GraphQLError(message, {
    extensions: {
      status: status,
      messageCode: messageCode,
    },
  });
}

export type ErrorType = {
  property: string,
  message: string,
  errorCode: number,
  developerNote?: string
}

export function validateGraphqlError(
  errors: ErrorType[]
): GraphQLError {
  return new GraphQLError("Invalid Validation", {
    extensions: {
      status: 400,
      errors,
      code: "INVALID_VALIDATION"
    },
  });
}