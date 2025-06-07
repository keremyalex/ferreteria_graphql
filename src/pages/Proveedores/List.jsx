import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PROVEEDORES, ELIMINAR_PROVEEDOR } from '../../graphql/proveedores';
import { toast } from 'react-toastify';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Modal } from '../../components/Modal';

export function ProveedoresList() {
  const [proveedorAEliminar, setProveedorAEliminar] = useState(null);
  const { loading, error, data } = useQuery(GET_PROVEEDORES);

  const [eliminarProveedor] = useMutation(ELIMINAR_PROVEEDOR, {
    refetchQueries: [{ query: GET_PROVEEDORES }],
    onCompleted: () => {
      toast.success('Proveedor eliminado correctamente');
      setProveedorAEliminar(null);
    },
    onError: (error) => {
      toast.error(error.message);
      setProveedorAEliminar(null);
    }
  });

  const handleEliminar = async () => {
    try {
      await eliminarProveedor({
        variables: { id: proveedorAEliminar.id }
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
        Error al cargar los proveedores: {error.message}
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded shadow">
      <div className="flex flex-col justify-between gap-4 mb-6 sm:flex-row">
        <h2 className="text-xl font-semibold">Proveedores</h2>
        <Link
          to="/app/proveedores/crear"
          className="flex items-center justify-center gap-2 px-4 py-2 text-center text-white bg-blue-600 rounded hover:bg-blue-700"
        >
          <PlusIcon className="w-5 h-5" />
          Nuevo Proveedor
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 font-medium text-left text-gray-700 whitespace-nowrap">Nombre</th>
              <th className="px-4 py-2 font-medium text-left text-gray-700 whitespace-nowrap">NIT</th>
              <th className="px-4 py-2 font-medium text-left text-gray-700 whitespace-nowrap">Teléfono</th>
              <th className="px-4 py-2 font-medium text-left text-gray-700 whitespace-nowrap">Email</th>
              <th className="px-4 py-2 font-medium text-left text-gray-700 whitespace-nowrap">Dirección</th>
              <th className="px-4 py-2 font-medium text-left text-gray-700 whitespace-nowrap">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.proveedores.map((proveedor) => (
              <tr key={proveedor.id}>
                <td className="px-4 py-2 whitespace-nowrap">{proveedor.nombre}</td>
                <td className="px-4 py-2 whitespace-nowrap">{proveedor.nit}</td>
                <td className="px-4 py-2 whitespace-nowrap">{proveedor.telefono}</td>
                <td className="px-4 py-2 whitespace-nowrap">{proveedor.email}</td>
                <td className="px-4 py-2 whitespace-nowrap">{proveedor.direccion}</td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/app/proveedores/editar/${proveedor.id}`}
                      className="p-1 text-blue-600 hover:text-blue-800"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => setProveedorAEliminar(proveedor)}
                      className="p-1 text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={!!proveedorAEliminar}
        onClose={() => setProveedorAEliminar(null)}
        title="Confirmar eliminación"
      >
        <div className="mt-2">
          <p className="text-sm text-gray-500">
            ¿Estás seguro de que deseas eliminar al proveedor {proveedorAEliminar?.nombre}?
            Esta acción no se puede deshacer.
          </p>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            onClick={() => setProveedorAEliminar(null)}
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