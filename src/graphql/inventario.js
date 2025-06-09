import { gql } from '@apollo/client';
import { REGISTRAR_MOVIMIENTO } from './movimientos';

export const GET_STOCK_PRODUCTO = gql`
  query GetProductoConStock($id: ID!) {
    producto(id: $id) {
      id
      nombre
      stocks {
        id
        cantidad
        estado
        almacen {
          id
          nombre
          ubicacion
        }
      }
    }
  }
`;

// Agregar consulta para refrescar el stock después de un movimiento
export const REFRESCAR_STOCK = gql`
  query RefrescarStock($id: ID!) {
    producto(id: $id) {
      id
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
  }
`;

export {
  REGISTRAR_MOVIMIENTO
}; 