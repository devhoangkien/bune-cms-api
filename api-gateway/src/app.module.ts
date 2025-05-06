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
import {
  INVALID_AUTH_TOKEN,
  INVALID_BEARER_TOKEN,
  UNAUTHORIZED,
  UNAUTHORIZED_MESSAGE,
} from './app.constants';
import { LoggerModule } from '@bune/common';
import {
  YogaGatewayDriver,
  YogaGatewayDriverConfig,
} from '@graphql-yoga/nestjs-federation';
import { GraphQLClient } from 'graphql-request';
import { extractUniquePermissions } from './common';
import { LRUCache } from 'lru-cache';

// Initialize cache with LRU (Least Recently Used)
const cache = new LRUCache<string, any>({
  max: 100, // Maximum number of items in cache
  ttl: 1000 * 60 * 5, // Cache lifetime (5 minutes)
});

// GraphQL call with cache
async function cachedRequest(query: string, variables: any) {
  const cacheKey = JSON.stringify({ query, variables });

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  // If not in cache, make request
  const data = await client.request(query, variables);

  cache.set(cacheKey, data);

  return data;
}

const getToken = (authToken: string): string => {
  const match = authToken.match(/^Bearer (.*)$/);
  if (!match || match.length < 2) {
    throw new BadRequestException({
      code: UNAUTHORIZED,
      message: UNAUTHORIZED_MESSAGE,
    });
  }
  return match[1];
};

const decodeToken = (tokenString: string) => {
  if (!process.env.JWT_SECRET) {
    throw new BadRequestException(
      'Secret key not found in environment variables',
    );
  }
  const decoded = verify(tokenString, process.env.JWT_SECRET);
  if (!decoded) {
    throw new BadRequestException({
      code: UNAUTHORIZED,
      message: UNAUTHORIZED_MESSAGE,
    });
  }
  return decoded;
};

// Apollo Client for querying user service
const client = new GraphQLClient(process.env.USER_SERVICE_URL || '');
const query = `
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
`;

const handleAuth = async ({ req }) => {
  try {
    if (req.headers.authorization) {
      const token = getToken(req.headers.authorization);
      const decoded = decodeToken(token);
      // Call UserService to get user roles
      const variables = { keys: decoded.roles };

      const data = await cachedRequest(query, variables);
      console.log(data);
      const uniquePermissions = extractUniquePermissions(data);
      return {
        userId: decoded.userId,
        permissions: JSON.stringify(uniquePermissions),
        authorization: `${req.headers.authorization}`,
      };
    }
  } catch (err) {
    throw new BadRequestException({
      code: UNAUTHORIZED,
      message: UNAUTHORIZED_MESSAGE,
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
