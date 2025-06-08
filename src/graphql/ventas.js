import { gql } from "@apollo/client";

// Queries
export const GET_VENTAS = gql`
  query GetVentas {
    ventas {
      id
      fecha
      total
      estado
      metodo_pago
      cliente {
        id
        nombre
        apellido
        email
        ci
      }
      vendedor_id
      vendedor {
        id
      }
      detalles {
        id
        cantidad
        precio_unitario
        subtotal
        producto_id
      }
      created_at
      updated_at
      notas
    }
  }
`;

export const GET_VENTA = gql`
  query GetVenta($id: Int!) {
    venta(id: $id) {
      id
      fecha
      total
      estado
      metodo_pago
      cliente {
        id
        nombre
        apellido
        email
        ci
        telefono
        direccion
        tipo_cliente
      }
      vendedor_id
      vendedor {
        id
      }
      detalles {
        id
        cantidad
        precio_unitario
        subtotal
        producto_id
      }
      created_at
      updated_at
      notas
    }
  }
`;

export const GET_DETALLES_VENTA = gql`
  query GetDetallesVenta($ventaId: Int!) {
    detallesPorVenta(ventaId: $ventaId) {
      id
      cantidad
      precio_unitario
      subtotal
      notas
      # producto {
      #   id
      # }
      producto_id
      created_at
      updated_at
    }
  }
`;

export const GET_FACTURAS = gql`
  query GetFacturas {
    facturas {
      id
      numero
      fecha
      monto_total
      venta {
        id
      }
    }
  }
`;

export const GET_FACTURA = gql`
  query GetFactura($id: Int!) {
    factura(id: $id) {
      id
      numero
      fecha
      monto_total
      venta {
        id
        fecha
        total
        estado
        metodo_pago
        cliente {
          id
          nombre
          apellido
          ci
          email
          telefono
          direccion
          tipo_cliente
        }
        detalles {
          id
          cantidad
          precio_unitario
          subtotal
          producto_id
        }
      }
    }
  }
`;

export const GET_CLIENTES = gql`
  query GetClientes {
    clientes {
      id
      nombre
      apellido
      ci
    }
  }
`;

export const GET_PRODUCTOS = gql`
  query GetProductos {
    productos {
      id
      nombre
      descripcion
      precio
    }
  }
`;

export const GET_FACTURA_BY_VENTA = gql`
  query GetFacturaByVenta($ventaId: Int!) {
    facturas {
      id
      numero
      fecha
      monto_total
      venta {
        id
      }
    }
  }
`;

// Mutations
export const CREAR_VENTA = gql`
  mutation CrearVenta(
    $clienteId: Int!
    $vendedorId: String!
    $total: Float!
    $estado: EstadoVenta!
    $metodoPago: MetodoPago!
  ) {
    crearVenta(
      clienteId: $clienteId
      vendedorId: $vendedorId
      total: $total
      estado: $estado
      metodoPago: $metodoPago
    ) {
      id
      fecha
      total
      estado
      metodo_pago
      cliente {
        id
        nombre
        apellido
      }
      vendedor_id
      vendedor {
        id
      }
    }
  }
`;

export const ACTUALIZAR_VENTA = gql`
  mutation ActualizarVenta(
    $id: Int!
    $estado: EstadoVenta
    $metodoPago: MetodoPago
  ) {
    actualizarVenta(
      id: $id
      estado: $estado
      metodoPago: $metodoPago
    ) {
      id
      estado
      metodo_pago
    }
  }
`;

export const CREAR_DETALLE_VENTA = gql`
  mutation CrearDetalleVenta(
    $ventaId: Int!
    $productoId: Int!
    $cantidad: Int!
    $precioUnitario: Float!
  ) {
    crearDetalleVenta(
      ventaId: $ventaId
      productoId: $productoId
      cantidad: $cantidad
      precioUnitario: $precioUnitario
    ) {
      id
      cantidad
      precio_unitario
      subtotal
    }
  }
`;

export const ACTUALIZAR_DETALLE_VENTA = gql`
  mutation ActualizarDetalleVenta(
    $id: Int!
    $cantidad: Int
    $precioUnitario: Float
  ) {
    actualizarDetalleVenta(
      id: $id
      cantidad: $cantidad
      precioUnitario: $precioUnitario
    ) {
      id
      cantidad
      precio_unitario
      subtotal
    }
  }
`;

export const ELIMINAR_DETALLE_VENTA = gql`
  mutation EliminarDetalleVenta($id: Int!) {
    eliminarDetalleVenta(id: $id)
  }
`;

export const CREAR_FACTURA = gql`
  mutation CrearFactura($ventaId: Int!, $montoTotal: Float!) {
    crearFactura(ventaId: $ventaId, monto_total: $montoTotal) {
      id
      numero
      fecha
      monto_total
      venta {
        id
      }
    }
  }
`;
