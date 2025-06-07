import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_ALMACEN, UPDATE_ALMACEN, GET_ALMACEN, GET_ALMACENES } from '../../graphql/almacenes';
import { toast } from 'react-toastify';

export function AlmacenForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    nombre: '',
    ubicacion: ''
  });

  const { data: almacenData, loading: loadingAlmacen } = useQuery(GET_ALMACEN, {
    variables: { id },
    skip: !isEditing,
    onCompleted: (data) => {
      if (data?.almacen) {
        setFormData({
          nombre: data.almacen.nombre,
          ubicacion: data.almacen.ubicacion
        });
      }
    },
    onError: (error) => {
      console.error('Error al obtener almacén:', error);
      toast.error(`Error al cargar los datos del almacén: ${error.message}`);
    }
  });

  const [createAlmacen, { loading: loadingCreate }] = useMutation(CREATE_ALMACEN, {
    refetchQueries: [{ query: GET_ALMACENES }],
    onCompleted: () => {
      toast.success('Almacén creado correctamente');
      navigate('/app/almacenes');
    },
    onError: (error) => {
      toast.error(`Error al crear almacén: ${error.message}`);
    }
  });

  const [updateAlmacen, { loading: loadingUpdate }] = useMutation(UPDATE_ALMACEN, {
    refetchQueries: [{ query: GET_ALMACENES }],
    onCompleted: () => {
      toast.success('Almacén actualizado correctamente');
      navigate('/app/almacenes');
    },
    onError: (error) => {
      toast.error(`Error al actualizar almacén: ${error.message}`);
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (isEditing) {
        await updateAlmacen({
          variables: {
            id,
            ...formData
          }
        });
      } else {
        await createAlmacen({
          variables: formData
        });
      }
    } catch (error) {
      console.error('Error al guardar:', error);
      toast.error(`Error al ${isEditing ? 'actualizar' : 'crear'} almacén: ${error.message}`);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loadingAlmacen) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {isEditing ? 'Editar Almacén' : 'Nuevo Almacén'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          {/* Nombre */}
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nombre del almacén"
              value={formData.nombre}
              onChange={handleChange}
            />
          </div>

          {/* Ubicación */}
          <div>
            <label htmlFor="ubicacion" className="block text-sm font-medium text-gray-700 mb-1">
              Ubicación
            </label>
            <textarea
              id="ubicacion"
              name="ubicacion"
              required
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Dirección o ubicación del almacén"
              value={formData.ubicacion}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/app/almacenes')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loadingCreate || loadingUpdate}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loadingCreate || loadingUpdate ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </form>
    </div>
  );
} 