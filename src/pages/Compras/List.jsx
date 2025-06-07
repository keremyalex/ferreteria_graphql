import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_COMPRAS, ELIMINAR_COMPRA, GET_PROVEEDORES } from '../../graphql/proveedores';
import { GET_PRODUCTOS } from '../../graphql/productos';
import { toast } from 'react-toastify';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { Modal } from '../../components/Modal';

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

export function ComprasList() {
  const [compraAEliminar, setCompraAEliminar] = useState(null);
  const { loading, error, data } = useQuery(GET_COMPRAS, {
    onError: (error) => {
      toast.error(error.message || 'Error al cargar las compras');
    }
  });

  const { data: proveedoresData } = useQuery(GET_PROVEEDORES);
  const { data: productosData } = useQuery(GET_PRODUCTOS);

  const [eliminarCompra] = useMutation(ELIMINAR_COMPRA, {
    onCompleted: () => {
      toast.success('Compra eliminada correctamente');
      setCompraAEliminar(null);
    },
    onError: (error) => {
      toast.error(error.message);
      setCompraAEliminar(null);
    },
    refetchQueries: [{ query: GET_COMPRAS }]
  });

  // Funciones auxiliares para obtener nombres
  const getNombreProveedor = (id) => {
    const proveedor = proveedoresData?.proveedores?.find(p => p.id === parseInt(id));
    return proveedor ? proveedor.nombre : `Proveedor #${id}`;
  };

  const getNombreProducto = (id) => {
    const producto = productosData?.productos?.find(p => p.id === parseInt(id));
    return producto ? `${producto.nombre} (${producto.unidadMedida.abreviatura})` : `Producto #${id}`;
  };

  const handleEliminar = async () => {
    try {
      await eliminarCompra({
        variables: { id: compraAEliminar.id }
      });
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
  };

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
        Error al cargar las compras: {error.message}
      </div>
    );
  }

  // Si no hay compras, mostrar mensaje
  if (!data?.compras || data.compras.length === 0) {
    return (
      <div className="p-6 bg-white rounded shadow">
        <div className="flex flex-col justify-between gap-4 mb-6 sm:flex-row">
          <h2 className="text-xl font-semibold">Compras</h2>
          <Link
            to="/app/compras/crear"
            className="flex items-center justify-center gap-2 px-4 py-2 text-center text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            <PlusIcon className="w-5 h-5" />
            Nueva Compra
          </Link>
        </div>
        <p className="text-center text-gray-500">No hay compras registradas</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded shadow">
      <div className="flex flex-col justify-between gap-4 mb-6 sm:flex-row">
        <h2 className="text-xl font-semibold">Compras</h2>
        <Link
          to="/app/compras/crear"
          className="flex items-center justify-center gap-2 px-4 py-2 text-center text-white bg-blue-600 rounded hover:bg-blue-700"
        >
          <PlusIcon className="w-5 h-5" />
          Nueva Compra
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 font-medium text-left text-gray-700 whitespace-nowrap">ID</th>
              <th className="px-4 py-2 font-medium text-left text-gray-700 whitespace-nowrap">Fecha</th>
              <th className="px-4 py-2 font-medium text-left text-gray-700 whitespace-nowrap">Proveedor</th>
              <th className="px-4 py-2 font-medium text-left text-gray-700 whitespace-nowrap">Total</th>
              <th className="px-4 py-2 font-medium text-left text-gray-700 whitespace-nowrap">Estado</th>
              <th className="px-4 py-2 font-medium text-left text-gray-700 whitespace-nowrap">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.compras.map((compra) => (
              <tr key={compra.id}>
                <td className="px-4 py-2 whitespace-nowrap">{compra.id}</td>
                <td className="px-4 py-2 whitespace-nowrap">{formatDate(compra.fechaCompra)}</td>
                <td className="px-4 py-2 whitespace-nowrap">{getNombreProveedor(compra.proveedorId)}</td>
                <td className="px-4 py-2 whitespace-nowrap">{formatCurrency(compra.total)}</td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estadoColors[compra.estado]}`}>
                    {compra.estado.charAt(0).toUpperCase() + compra.estado.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/app/compras/ver/${compra.id}`}
                      className="p-1 text-gray-600 hover:text-gray-800"
                      title="Ver detalles"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </Link>
                    {compra.estado === 'pendiente' && (
                      <>
                        <Link
                          to={`/app/compras/editar/${compra.id}`}
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="Editar"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => setCompraAEliminar(compra)}
                          className="p-1 text-red-600 hover:text-red-800"
                          title="Eliminar"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={!!compraAEliminar}
        onClose={() => setCompraAEliminar(null)}
        title="Confirmar eliminación"
      >
        <div className="mt-2">
          <p className="text-sm text-gray-500">
            ¿Estás seguro de que deseas eliminar la compra #{compraAEliminar?.id}?
            Esta acción no se puede deshacer.
          </p>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            onClick={() => setCompraAEliminar(null)}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            onClick={handleEliminar}
          >
            Eliminar
          </button>
        </div>
      </Modal>
    </div>
  );
} 