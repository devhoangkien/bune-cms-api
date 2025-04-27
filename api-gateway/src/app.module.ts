import {
  Module,
  BadRequestException,
  HttpStatus,
  HttpException,
  UnauthorizedException,
  MiddlewareConsumer,
} from '@nestjs/common';
import { IntrospectAndCompose, RemoteGraphQLDataSource } from '@apollo/gateway';
import { GraphQLModule } from '@nestjs/graphql';
import { verify, decode } from 'jsonwebtoken';
import { INVALID_AUTH_TOKEN, INVALID_BEARER_TOKEN, UNAUTHORIZED, UNAUTHORIZED_MESSAGE } from './app.constants';
import { LoggerModule } from '@bune/common';
import { YogaGatewayDriver, YogaGatewayDriverConfig } from '@graphql-yoga/nestjs-federation'
import { ApolloClient, gql, HttpLink, InMemoryCache } from '@apollo/client';
import { extractUniquePermissions } from './common';

const getToken = (authToken: string): string => {
  const match = authToken.match(/^Bearer (.*)$/);
  if (!match || match.length < 2) {
    throw new BadRequestException({
      code: UNAUTHORIZED,
      message:UNAUTHORIZED_MESSAGE
    });
  }
  return match[1];
};

const decodeToken = (tokenString: string) => {
  if(!process.env.JWT_SECRET) {
    throw new BadRequestException('Secret key not found in environment variables');
  }
  const decoded = verify(tokenString, process.env.JWT_SECRET);
  if (!decoded) {
    throw new BadRequestException({
      code: UNAUTHORIZED,
      message:UNAUTHORIZED_MESSAGE
    });
  }
  return decoded;
};

// Apollo Client for querying user service
const client = new ApolloClient({
  link: new HttpLink({ uri: process.env.USER_SERVICE_URL , fetch }),  
  cache: new InMemoryCache(),
});

const handleAuth = async ({ req }) => {
  try {
    if (req.headers.authorization) {
      const token = getToken(req.headers.authorization);
      const decoded = decodeToken(token);
    // Call UserService to get user roles
    const { data } = await client.query({
      query: gql`
        query getRolesByKeys($keys: String!) {
          getRolesByKeys(keys: $keys) {
            id
            key
            name
            permissions {
              action
              id
              key
              name
              resource
              status
            }
          }
        }
      `,
      variables: { keys: decoded.roles }, // Assuming roles is a string or array of strings
    });
    const uniquePermissions = extractUniquePermissions(data);
      return {
        userId: decoded.userId,
        permissions:JSON.stringify(uniquePermissions),
        authorization: `${req.headers.authorization}`,
      };
    }
  } catch (err) {
    throw new BadRequestException({
      code: UNAUTHORIZED,
      message:UNAUTHORIZED_MESSAGE
    });
  }
};
@Module({
  imports: [
    GraphQLModule.forRoot<YogaGatewayDriverConfig>({
      server: {
        context: handleAuth,
      },
      driver: YogaGatewayDriver,
      gateway: {
        buildService: ({ name, url }) => {
          return new RemoteGraphQLDataSource({
            url,
            willSendRequest({ request, context }: any) {
              request.http.headers.set('userId', context.userId);
              // for now pass authorization also
              request.http.headers.set('authorization', context.authorization);
              request.http.headers.set('permissions', context.permissions);
            },
          });
        },
        supergraphSdl: new IntrospectAndCompose({
          subgraphs: [
            { name: 'user-service', url: process.env.USER_SERVICE_URL },
          ],
        }),
      },
    }),
    LoggerModule.forRoot({
      enableFile: true,
      enableCloudWatch: false,
      enableElasticsearch: false,
      enableLoki: false,
      enableDatadog: false,
    }),
  ],
})
export class AppModule {}

