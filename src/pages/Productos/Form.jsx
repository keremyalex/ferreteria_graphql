import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { 
  GET_PRODUCTO, 
  CREATE_PRODUCTO, 
  UPDATE_PRODUCTO,
  GET_CATEGORIAS,
  GET_UNIDADES_MEDIDA,
  GET_ALMACENES
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
    precio: '',
    categoriaId: '',
    unidadMedidaId: '',
    almacenId: '',
    urlImagen: '',
    cantidad: ''
  });

  // Consultas para obtener datos necesarios
  const { data: categoriasData } = useQuery(GET_CATEGORIAS);
  const { data: unidadesMedidaData } = useQuery(GET_UNIDADES_MEDIDA);
  const { data: almacenesData } = useQuery(GET_ALMACENES);
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
          precio: producto.precio.toString() || '',
          categoriaId: producto.categoria.id || '',
          unidadMedidaId: producto.unidadMedida.id || '',
          almacenId: producto.stocks[0]?.almacen.id || '',
          urlImagen: producto.urlImagen || '',
          cantidad: producto.stocks[0]?.cantidad.toString() || '0'
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
        precio: parseFloat(formData.precio),
        categoriaId: parseInt(formData.categoriaId),
        unidadMedidaId: parseInt(formData.unidadMedidaId),
        almacenId: parseInt(formData.almacenId),
        urlImagen: formData.urlImagen || undefined,
        cantidad: parseInt(formData.cantidad)
      };

      if (isEditing) {
        await updateProducto({
          variables: {
            id: numericId,
            updateProductoInput: input
          }
        });
      } else {
        await createProducto({
          variables: {
            createProductoInput: input
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              placeholder="Nombre del producto"
              value={formData.nombre}
              onChange={handleChange}
            />
          </div>

          {/* Precio */}
          <div>
            <label htmlFor="precio" className="block text-sm font-medium text-gray-700 mb-1">
              Precio
            </label>
            <input
              type="number"
              id="precio"
              name="precio"
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
              value={formData.precio}
              onChange={handleChange}
            />
          </div>

          {/* Categoría */}
          <div>
            <label htmlFor="categoriaId" className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <select
              id="categoriaId"
              name="categoriaId"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
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
            <label htmlFor="unidadMedidaId" className="block text-sm font-medium text-gray-700 mb-1">
              Unidad de Medida
            </label>
            <select
              id="unidadMedidaId"
              name="unidadMedidaId"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
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

          {/* Almacén */}
          <div>
            <label htmlFor="almacenId" className="block text-sm font-medium text-gray-700 mb-1">
              Almacén
            </label>
            <select
              id="almacenId"
              name="almacenId"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
              value={formData.almacenId}
              onChange={handleChange}
            >
              <option value="">Seleccione un almacén</option>
              {almacenesData?.almacenes.map((almacen) => (
                <option key={almacen.id} value={almacen.id}>
                  {almacen.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Cantidad */}
          <div>
            <label htmlFor="cantidad" className="block text-sm font-medium text-gray-700 mb-1">
              Cantidad en Stock
            </label>
            <input
              type="number"
              id="cantidad"
              name="cantidad"
              required
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
              value={formData.cantidad}
              onChange={handleChange}
            />
          </div>

          {/* URL de la Imagen */}
          <div>
            <label htmlFor="urlImagen" className="block text-sm font-medium text-gray-700 mb-1">
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
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
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