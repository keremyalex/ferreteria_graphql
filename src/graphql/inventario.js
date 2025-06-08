import { gql } from '@apollo/client';

export const REGISTRAR_MOVIMIENTO = gql`
  mutation RegistrarMovimiento($input: MovimientoInput!) {
    registrarMovimiento(input: $input) {
      id
      fecha
      producto {
        id
        nombre
      }
      tipoMovimiento
      cantidad
      almacenOrigen {
        id
        nombre
      }
      almacenDestino {
        id
        nombre
      }
      observaciones
      estado
    }
  }
`;

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