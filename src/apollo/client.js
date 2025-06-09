import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URL,
});

const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    for (let err of graphQLErrors) {
      // Si el error es de autenticación
      if (err.extensions?.code === 'UNAUTHENTICATED' || err.message.includes('Unauthorized')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }
      console.log(
        `[GraphQL error]: Message: ${err.message}, Path: ${err.path}`,
        '\nExtensions:', JSON.stringify(err.extensions, null, 2)
      );
    }
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
