import { gql } from '@apollo/client';

export const GET_TODOS_MOVIMIENTOS = gql`
  query GetTodosMovimientos {
    todosLosMovimientos {
      id
      fecha
      producto {
        id
        nombre
        unidadMedida {
          id
          nombre
          abreviatura
        }
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

export const GET_MOVIMIENTOS = gql`
  query GetMovimientos($productoId: ID) {
    movimientosInventario(productoId: $productoId) {
      id
      fecha
      tipoMovimiento
      cantidad
      estado
      observaciones
      producto {
        id
      }
      almacenOrigen {
        id
      }
      almacenDestino {
        id
      }
    }
  }
`;

export const GET_MOVIMIENTO = gql`
  query GetMovimiento($id: ID!) {
    movimientoInventario(id: $id) {
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

export const CREATE_MOVIMIENTO = gql`
  mutation CreateMovimiento($input: MovimientoInput!) {
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

export const ANULAR_MOVIMIENTO = gql`
  mutation AnularMovimiento($id: ID!, $motivo: String!) {
    anularMovimiento(id: $id, motivo: $motivo)
  }
`; 