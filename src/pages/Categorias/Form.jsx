import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_CATEGORIA, UPDATE_CATEGORIA, GET_CATEGORIA, GET_CATEGORIAS } from '../../graphql/categorias';
import { toast } from 'react-toastify';

export function CategoriaForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  });

  const { data: categoriaData, loading: loadingCategoria } = useQuery(GET_CATEGORIA, {
    variables: { id },
    skip: !isEditing,
    onCompleted: (data) => {
      if (data?.categoria) {
        setFormData({
          nombre: data.categoria.nombre,
          descripcion: data.categoria.descripcion || ''
        });
      }
    },
    onError: (error) => {
      console.error('Error al obtener categoría:', error);
      toast.error(`Error al cargar los datos de la categoría: ${error.message}`);
    }
  });

  const [createCategoria, { loading: loadingCreate }] = useMutation(CREATE_CATEGORIA, {
    refetchQueries: [{ query: GET_CATEGORIAS }],
    onCompleted: () => {
      toast.success('Categoría creada correctamente');
      navigate('/app/categorias');
    },
    onError: (error) => {
      toast.error(`Error al crear categoría: ${error.message}`);
    }
  });

  const [updateCategoria, { loading: loadingUpdate }] = useMutation(UPDATE_CATEGORIA, {
    refetchQueries: [{ query: GET_CATEGORIAS }],
    onCompleted: () => {
      toast.success('Categoría actualizada correctamente');
      navigate('/app/categorias');
    },
    onError: (error) => {
      toast.error(`Error al actualizar categoría: ${error.message}`);
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (isEditing) {
        await updateCategoria({
          variables: {
            id,
            ...formData
          }
        });
      } else {
        await createCategoria({
          variables: formData
        });
      }
    } catch (error) {
      console.error('Error al guardar:', error);
      toast.error(`Error al ${isEditing ? 'actualizar' : 'crear'} categoría: ${error.message}`);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loadingCategoria) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
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
              placeholder="Nombre de la categoría"
              value={formData.nombre}
              onChange={handleChange}
            />
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Descripción de la categoría (opcional)"
              value={formData.descripcion}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/app/categorias')}
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