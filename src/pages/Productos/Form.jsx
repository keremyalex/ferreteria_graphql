import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { 
  GET_PRODUCTO, 
  CREATE_PRODUCTO, 
  UPDATE_PRODUCTO,
  GET_CATEGORIAS,
  GET_UNIDADES_MEDIDA
} from '../../graphql/productos';
import { toast } from 'react-toastify';

export function ProductoForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const numericId = id ? parseInt(id) : null;

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    categoriaId: '',
    unidadMedidaId: '',
    urlImagen: ''
  });

  // Consultas para obtener datos necesarios
  const { data: categoriasData } = useQuery(GET_CATEGORIAS);
  const { data: unidadesMedidaData } = useQuery(GET_UNIDADES_MEDIDA);
  const { data: productoData, loading: loadingProducto } = useQuery(GET_PRODUCTO, {
    variables: { id: numericId },
    skip: !isEditing,
    onCompleted: (data) => {
      console.log('Datos recibidos del producto:', data);
      if (data?.producto) {
        const { producto } = data;
        setFormData({
          nombre: producto.nombre || '',
          descripcion: producto.descripcion || '',
          categoriaId: producto.categoria.id || '',
          unidadMedidaId: producto.unidadMedida.id || '',
          urlImagen: producto.urlImagen || ''
        });
      }
    },
    onError: (error) => {
      console.error('Error al obtener producto:', error);
      toast.error(`Error al cargar los datos del producto: ${error.message}`);
    }
  });

  // Mutaciones
  const [createProducto, { loading: loadingCreate }] = useMutation(CREATE_PRODUCTO, {
    onCompleted: () => {
      toast.success('Producto creado correctamente');
      navigate('/app/productos');
    },
    onError: (error) => {
      toast.error(`Error al crear producto: ${error.message}`);
    }
  });

  const [updateProducto, { loading: loadingUpdate }] = useMutation(UPDATE_PRODUCTO, {
    onCompleted: () => {
      toast.success('Producto actualizado correctamente');
      navigate('/app/productos');
    },
    onError: (error) => {
      toast.error(`Error al actualizar producto: ${error.message}`);
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const input = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        categoriaId: formData.categoriaId,
        unidadMedidaId: formData.unidadMedidaId,
        urlImagen: formData.urlImagen || undefined
      };

      if (isEditing) {
        await updateProducto({
          variables: {
            id: numericId,
            input: input
          }
        });
      } else {
        await createProducto({
          variables: {
            input: input
          }
        });
      }
    } catch (error) {
      console.error('Error al guardar:', error);
      toast.error(`Error al ${isEditing ? 'actualizar' : 'crear'} producto: ${error.message}`);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loadingProducto) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">
        {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Nombre */}
          <div>
            <label htmlFor="nombre" className="block mb-1 text-sm font-medium text-gray-700">
              Nombre
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nombre del producto"
              value={formData.nombre}
              onChange={handleChange}
            />
          </div>

          {/* Categoría */}
          <div>
            <label htmlFor="categoriaId" className="block mb-1 text-sm font-medium text-gray-700">
              Categoría
            </label>
            <select
              id="categoriaId"
              name="categoriaId"
              required
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              value={formData.categoriaId}
              onChange={handleChange}
            >
              <option value="">Seleccione una categoría</option>
              {categoriasData?.categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Unidad de Medida */}
          <div>
            <label htmlFor="unidadMedidaId" className="block mb-1 text-sm font-medium text-gray-700">
              Unidad de Medida
            </label>
            <select
              id="unidadMedidaId"
              name="unidadMedidaId"
              required
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              value={formData.unidadMedidaId}
              onChange={handleChange}
            >
              <option value="">Seleccione una unidad de medida</option>
              {unidadesMedidaData?.unidadesMedida.map((unidad) => (
                <option key={unidad.id} value={unidad.id}>
                  {unidad.nombre} ({unidad.abreviatura})
                </option>
              ))}
            </select>
          </div>

          {/* URL de la Imagen */}
          <div>
            <label htmlFor="urlImagen" className="block mb-1 text-sm font-medium text-gray-700">
              URL de la Imagen
            </label>
            <input
              type="url"
              id="urlImagen"
              name="urlImagen"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://ejemplo.com/imagen.jpg"
              value={formData.urlImagen}
              onChange={handleChange}
            />
          </div>

          {/* Descripción - Span completo */}
          <div className="md:col-span-2">
            <label htmlFor="descripcion" className="block mb-1 text-sm font-medium text-gray-700">
              Descripción
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Descripción del producto"
              value={formData.descripcion}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/app/productos')}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loadingCreate || loadingUpdate}
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loadingCreate || loadingUpdate ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </form>
    </div>
  );
} 