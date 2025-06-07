import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_COMPRA } from '../../graphql/proveedores';
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
  const { loading, error, data } = useQuery(GET_COMPRA, {
    variables: { id: parseInt(id) }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        Error al cargar los detalles de la compra: {error.message}
      </div>
    );
  }

  const { compra } = data;

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
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${estadoColors[compra.estado]}`}>
          {compra.estado.charAt(0).toUpperCase() + compra.estado.slice(1)}
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
                <dt className="text-sm text-gray-600">Proveedor ID:</dt>
                <dd className="text-sm font-medium">{compra.proveedorId}</dd>
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
                <th className="px-4 py-2 font-medium text-left text-gray-700">Producto ID</th>
                <th className="px-4 py-2 font-medium text-left text-gray-700">Cantidad</th>
                <th className="px-4 py-2 font-medium text-left text-gray-700">Precio Unitario</th>
                <th className="px-4 py-2 font-medium text-left text-gray-700">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {compra.detalles.map((detalle) => (
                <tr key={detalle.id}>
                  <td className="px-4 py-2">{detalle.productoId}</td>
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