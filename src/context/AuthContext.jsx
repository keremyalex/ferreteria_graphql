import { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';

const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      role
    }
  }
`;

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password)
  }
`;

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

export const ROLES = {
  ADMIN: 'ADMIN',
  VENDEDOR: 'VENDEDOR',
  ALMACENISTA: 'ALMACENISTA'
};

export const PERMISSIONS = {
  USUARIOS: {
    VIEW: [ROLES.ADMIN],
    CREATE: [ROLES.ADMIN],
    EDIT: [ROLES.ADMIN],
    DELETE: [ROLES.ADMIN]
  },
  PRODUCTOS: {
    VIEW: [ROLES.ADMIN, ROLES.VENDEDOR, ROLES.ALMACENISTA],
    CREATE: [ROLES.ADMIN, ROLES.ALMACENISTA],
    EDIT: [ROLES.ADMIN, ROLES.ALMACENISTA],
    DELETE: [ROLES.ADMIN]
  },
  VENTAS: {
    VIEW: [ROLES.ADMIN, ROLES.VENDEDOR],
    CREATE: [ROLES.ADMIN, ROLES.VENDEDOR],
    EDIT: [ROLES.ADMIN],
    DELETE: [ROLES.ADMIN]
  },
  INVENTARIO: {
    VIEW: [ROLES.ADMIN, ROLES.ALMACENISTA],
    CREATE: [ROLES.ADMIN, ROLES.ALMACENISTA],
    EDIT: [ROLES.ADMIN, ROLES.ALMACENISTA],
    DELETE: [ROLES.ADMIN]
  },
  CLIENTES: {
    VIEW: [ROLES.ADMIN, ROLES.VENDEDOR],
    CREATE: [ROLES.ADMIN, ROLES.VENDEDOR],
    EDIT: [ROLES.ADMIN, ROLES.VENDEDOR],
    DELETE: [ROLES.ADMIN]
  },
  ALMACENES: {
    VIEW: [ROLES.ADMIN, ROLES.ALMACENISTA],
    CREATE: [ROLES.ADMIN],
    EDIT: [ROLES.ADMIN],
    DELETE: [ROLES.ADMIN]
  },
  CATEGORIAS: {
    VIEW: [ROLES.ADMIN, ROLES.ALMACENISTA],
    CREATE: [ROLES.ADMIN],
    EDIT: [ROLES.ADMIN],
    DELETE: [ROLES.ADMIN]
  },
  UNIDADES_MEDIDA: {
    VIEW: [ROLES.ADMIN, ROLES.ALMACENISTA],
    CREATE: [ROLES.ADMIN],
    EDIT: [ROLES.ADMIN],
    DELETE: [ROLES.ADMIN]
  },
  PROVEEDORES: {
    VIEW: [ROLES.ADMIN, ROLES.ALMACENISTA],
    CREATE: [ROLES.ADMIN],
    EDIT: [ROLES.ADMIN],
    DELETE: [ROLES.ADMIN]
  },
  COMPRAS: {
    VIEW: [ROLES.ADMIN, ROLES.ALMACENISTA],
    CREATE: [ROLES.ADMIN, ROLES.ALMACENISTA],
    EDIT: [ROLES.ADMIN],
    DELETE: [ROLES.ADMIN]
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const { data, loading, refetch } = useQuery(ME_QUERY, {
    skip: !localStorage.getItem('token'),
    onError: (error) => {
      // Si hay un error de autenticación, limpiamos el token
      if (error.message.includes('Unauthorized') || 
          error.graphQLErrors?.some(err => 
            err.extensions?.code === 'UNAUTHENTICATED' || 
            err.message.includes('Unauthorized')
          )) {
        localStorage.removeItem('token');
        setUser(null);
      }
    }
  });

  const [loginMutation] = useMutation(LOGIN_MUTATION);

  useEffect(() => {
    if (data?.me) {
      setUser(data.me);
    }
    if (!loading) {
      setIsInitialized(true);
    }
  }, [data, loading]);

  const login = async (token) => {
    localStorage.setItem('token', token);
    await refetch();
  };

  const hasPermission = (permission, action) => {
    if (!user) return false;
    
    // El ADMIN tiene acceso total a todo
    if (user.role === ROLES.ADMIN) return true;
    
    return PERMISSIONS[permission]?.[action]?.includes(user.role) || false;
  };

  const hasRole = (roles) => {
    if (!user) return false;
    // El ADMIN siempre tiene acceso
    if (user.role === ROLES.ADMIN) return true;
    
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/login';
  };

  const value = {
    user,
    loading: !isInitialized || loading,
    isAuthenticated: !!user,
    login,
    logout,
    hasPermission,
    hasRole,
    loginMutation
  };

  // No renderizamos nada hasta que se complete la inicialización
  if (!isInitialized && loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 