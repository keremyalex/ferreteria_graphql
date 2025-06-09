import { gql } from '@apollo/client';
import { REGISTRAR_MOVIMIENTO } from './movimientos';

export const GET_PROVEEDORES = gql`
  query GetProveedores {
    proveedores {
      id
      nombre
      nit
      direccion
      telefono
      email
    }
  }
`;

export const GET_PROVEEDOR = gql`
  query GetProveedor($id: Int!) {
    proveedor(id: $id) {
      proveedor {
        id
        nombre
        nit
        direccion
        telefono
        email
      }
      error {
        message
        code
      }
    }
  }
`;

export const CREAR_PROVEEDOR = gql`
  mutation CrearProveedor($input: ProveedorInput!) {
    crearProveedor(input: $input) {
      proveedor {
        id
        nombre
        nit
        direccion
        telefono
        email
      }
      error {
        message
        code
      }
    }
  }
`;

export const ACTUALIZAR_PROVEEDOR = gql`
  mutation ActualizarProveedor($id: Int!, $input: ProveedorUpdateInput!) {
    actualizarProveedor(id: $id, input: $input) {
      proveedor {
        id
        nombre
        nit
        direccion
        telefono
        email
      }
      error {
        message
        code
      }
    }
  }
`;

export const ELIMINAR_PROVEEDOR = gql`
  mutation EliminarProveedor($id: Int!) {
    eliminarProveedor(id: $id) {
      success
      error {
        message
        code
      }
    }
  }
`;

export const GET_COMPRAS = gql`
  query GetCompras {
    compras {
      id
      proveedorId
      fechaCompra
      total
      estado
      detalles {
        id
        productoId
        cantidad
        precioUnitario
        subtotal
      }
    }
  }
`;

export const GET_COMPRA = gql`
  query GetCompra($id: Int!) {
    compra(id: $id) {
      compra {
        id
        proveedorId
        fechaCompra
        total
        estado
        detalles {
          id
          productoId
          cantidad
          precioUnitario
          subtotal
        }
      }
      error {
        message
        code
      }
    }
  }
`;

export const CREAR_COMPRA = gql`
  mutation CrearCompra($input: CompraInput!) {
    crearCompra(input: $input) {
      compra {
        id
        proveedorId
        fechaCompra
        total
        estado
        detalles {
          id
          productoId
          cantidad
          precioUnitario
          subtotal
        }
      }
      error {
        message
        code
      }
    }
  }
`;

export const ACTUALIZAR_COMPRA = gql`
  mutation ActualizarCompra($id: Int!, $input: CompraUpdateInput!) {
    actualizarCompra(id: $id, input: $input) {
      compra {
        id
        proveedorId
        fechaCompra
        total
        estado
        detalles {
          id
          productoId
          cantidad
          precioUnitario
          subtotal
        }
      }
      error {
        message
        code
      }
    }
  }
`;

export const ELIMINAR_COMPRA = gql`
  mutation EliminarCompra($id: Int!) {
    eliminarCompra(id: $id) {
      success
      error {
        message
        code
      }
    }
  }
`;

export {
  REGISTRAR_MOVIMIENTO
}; 