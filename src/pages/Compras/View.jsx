import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_COMPRA, GET_PROVEEDORES } from '../../graphql/proveedores';
import { GET_PRODUCTOS } from '../../graphql/productos';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'BOB'
  }).format(amount);
};

const estadoColors = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  completada: 'bg-green-100 text-green-800',
  cancelada: 'bg-red-100 text-red-800'
};

export function CompraView() {
  const { id } = useParams();
  const { loading: loadingCompra, error: errorCompra, data: compraData } = useQuery(GET_COMPRA, {
    variables: { id: parseInt(id) }
  });

  const { loading: loadingProductos, error: errorProductos, data: productosData } = useQuery(GET_PRODUCTOS);
  const { loading: loadingProveedores, error: errorProveedores, data: proveedoresData } = useQuery(GET_PROVEEDORES);

  if (loadingCompra || loadingProductos || loadingProveedores) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Cargando...</div>
      </div>
    );
  }

  if (errorCompra || errorProductos || errorProveedores) {
    return (
      <div className="p-4 text-center text-red-500">
        Error al cargar los datos: {errorCompra?.message || errorProductos?.message || errorProveedores?.message}
      </div>
    );
  }

  const compra = compraData?.compra?.compra;
  
  if (!compra) {
    return (
      <div className="p-4 text-center text-red-500">
        No se encontró la compra solicitada
      </div>
    );
  }

  const estadoText = compra.estado ? compra.estado.charAt(0).toUpperCase() + compra.estado.slice(1) : 'Desconocido';
  const estadoColor = estadoColors[compra.estado] || 'bg-gray-100 text-gray-800';

  const getProductoNombre = (productoId) => {
    const producto = productosData?.productos?.find(p => p.id === productoId.toString());
    return producto ? `${producto.nombre} (${producto.unidadMedida.abreviatura})` : `Producto #${productoId}`;
  };

  const getProveedorNombre = (proveedorId) => {
    const proveedor = proveedoresData?.proveedores?.find(p => p.id === parseInt(proveedorId));
    return proveedor ? proveedor.nombre : `Proveedor #${proveedorId}`;
  };

  return (
    <div className="p-6 bg-white rounded shadow">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            to="/app/compras"
            className="p-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <h2 className="text-xl font-semibold">Detalles de Compra #{compra.id}</h2>
        </div>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${estadoColor}`}>
          {estadoText}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2">
        <div>
          <h3 className="mb-2 text-sm font-medium text-gray-500">Información General</h3>
          <div className="p-4 bg-gray-50 rounded-lg">
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Fecha de Compra:</dt>
                <dd className="text-sm font-medium">{formatDate(compra.fechaCompra)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Proveedor:</dt>
                <dd className="text-sm font-medium">{getProveedorNombre(compra.proveedorId)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Total:</dt>
                <dd className="text-sm font-medium">{formatCurrency(compra.total)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="mb-4 text-lg font-medium">Detalles de la Compra</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 font-medium text-left text-gray-700">Producto</th>
                <th className="px-4 py-2 font-medium text-left text-gray-700">Cantidad</th>
                <th className="px-4 py-2 font-medium text-left text-gray-700">Precio Unitario</th>
                <th className="px-4 py-2 font-medium text-left text-gray-700">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {compra.detalles?.map((detalle) => (
                <tr key={detalle.id}>
                  <td className="px-4 py-2">{getProductoNombre(detalle.productoId)}</td>
                  <td className="px-4 py-2">{detalle.cantidad}</td>
                  <td className="px-4 py-2">{formatCurrency(detalle.precioUnitario)}</td>
                  <td className="px-4 py-2">{formatCurrency(detalle.subtotal)}</td>
                </tr>
              ))}
              <tr className="bg-gray-50">
                <td colSpan="3" className="px-4 py-2 font-medium text-right">Total:</td>
                <td className="px-4 py-2 font-medium">{formatCurrency(compra.total)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 