import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

const httpLink = createHttpLink({
  uri: 'http://localhost:3000/graphql',
});

const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    console.log('GraphQL Errors:', graphQLErrors);
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      console.log(
        `[GraphQL error]: Message: ${message}, Path: ${path}`,
        '\nExtensions:', JSON.stringify(extensions, null, 2)
      );
    });
  }

  if (networkError) {
    console.log('Network Error:', networkError);
  }
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        movimientosInventario: {
          merge(existing, incoming) {
            return incoming;
          }
        }
      }
    },
    MovimientoInventario: {
      keyFields: ['id'],
      fields: {
        producto: {
          merge: true
        },
        almacenOrigen: {
          merge: true
        },
        almacenDestino: {
          merge: true
        }
      }
    }
  },
  dataIdFromObject: object => {
    switch (object.__typename) {
      case 'MovimientoInventario': return `MovimientoInventario:${object.id}`;
      case 'Producto': return `Producto:${object.id}`;
      case 'Almacen': return `Almacen:${object.id}`;
      default: return null;
    }
  }
});

export const client = new ApolloClient({
  link: errorLink.concat(authLink.concat(httpLink)),
  cache,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
    mutate: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    }
  },
});

// Limpiar la caché al iniciar
client.clearStore();
