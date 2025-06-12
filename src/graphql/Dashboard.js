import { gql } from '@apollo/client';

export const GET_DASHBOARD_DATA = gql`
  query GetDashboardData {
    productos {
      id
      nombre
      precio
      stocks {
        id
        cantidad
        estado
        almacen {
          id
          nombre
        }
      }
    }
    todosLosMovimientos {
      id
      fecha
      tipoMovimiento
      cantidad
      estado
      observaciones
      producto {
        id
        nombre
        precio
      }
      almacenOrigen {
        id
        nombre
      }
      almacenDestino {
        id
        nombre
      }
    }
  }
`;

export const GET_PRODUCTOS_MAS_VENDIDOS = gql`
  query GetProductosMasVendidos($filtro: FiltroFechaInput!, $limite: Int) {
    productosMasVendidos(filtro: $filtro, limite: $limite) {
      producto_id
      cantidad_total
      monto_total
      numero_ventas
    }
  }
`;

export const GET_PRODUCTOS_NOMBRES = gql`
  query GetProductosNombres {
    productos {
      id
      nombre
    }
  }
`;

// Por ahora quitaremos la consulta por período ya que no está implementada en el backend
// Si necesitas filtrar por fecha, podemos hacerlo en el frontend 