import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import { 
  CREAR_COMPRA, 
  ACTUALIZAR_COMPRA, 
  GET_COMPRA, 
  GET_COMPRAS,
  GET_PROVEEDORES 
} from '../../graphql/proveedores';
import { GET_PRODUCTOS } from '../../graphql/productos';
import { toast } from 'react-toastify';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

export function CompraForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    proveedorId: '',
    detalles: [
      {
        productoId: '',
        cantidad: '',
        precioUnitario: ''
      }
    ]
  });

  const { data: proveedoresData } = useQuery(GET_PROVEEDORES);
  const { data: productosData } = useQuery(GET_PRODUCTOS);

  const { loading: loadingCompra, error: compraError, data: compraData } = useQuery(
    GET_COMPRA,
    {
      variables: { id: parseInt(id) },
      skip: !isEditing,
    }
  );

  const [crearCompra, { loading: loadingCreate }] = useMutation(CREAR_COMPRA, {
    refetchQueries: [{ query: GET_COMPRAS }],
    onCompleted: () => {
      toast.success('Compra creada exitosamente');
      navigate('/app/compras');
    },
    onError: (error) => {
      toast.error(`Error al crear la compra: ${error.message}`);
    }
  });

  const [actualizarCompra, { loading: loadingUpdate }] = useMutation(ACTUALIZAR_COMPRA, {
    refetchQueries: [{ query: GET_COMPRAS }],
    onCompleted: () => {
      toast.success('Compra actualizada exitosamente');
      navigate('/app/compras');
    },
    onError: (error) => {
      toast.error(`Error al actualizar la compra: ${error.message}`);
    }
  });

  useEffect(() => {
    if (isEditing && compraData?.compra?.compra) {
      const { proveedorId, detalles } = compraData.compra.compra;
      setFormData({
        proveedorId: proveedorId.toString(),
        detalles: detalles.map(({ productoId, cantidad, precioUnitario }) => ({
          productoId: productoId.toString(),
          cantidad: cantidad.toString(),
          precioUnitario: precioUnitario.toString()
        }))
      });
    }
  }, [isEditing, compraData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDetalleChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      detalles: prev.detalles.map((detalle, i) => 
        i === index ? { ...detalle, [field]: value } : detalle
      )
    }));
  };

  const addDetalle = () => {
    setFormData(prev => ({
      ...prev,
      detalles: [...prev.detalles, { productoId: '', cantidad: '', precioUnitario: '' }]
    }));
  };

  const removeDetalle = (index) => {
    setFormData(prev => ({
      ...prev,
      detalles: prev.detalles.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const input = {
        proveedorId: parseInt(formData.proveedorId),
        detalles: formData.detalles.map(detalle => ({
          productoId: parseInt(detalle.productoId),
          cantidad: parseInt(detalle.cantidad),
          precioUnitario: parseFloat(detalle.precioUnitario)
        }))
      };

      if (isEditing) {
        await actualizarCompra({
          variables: {
            id: parseInt(id),
            input: { estado: 'completada' }
          }
        });
      } else {
        await crearCompra({
          variables: { input }
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(`Error al procesar la compra: ${error.message}`);
    }
  };

  if (loadingCompra) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Cargando...</div>
      </div>
    );
  }

  if (compraError) {
    return (
      <div className="p-4 text-center text-red-500">
        Error al cargar la compra: {compraError.message}
      </div>
    );
  }

  const compra = compraData?.compra?.compra;

  return (
    <div className="p-4 bg-white rounded-lg shadow sm:p-6">
      <h2 className="mb-6 text-xl font-bold text-gray-900 sm:text-2xl">
        {isEditing ? 'Editar Compra' : 'Nueva Compra'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Proveedor */}
        <div>
          <label htmlFor="proveedorId" className="block mb-1 text-sm font-medium text-gray-700">
            Proveedor
          </label>
          <select
            id="proveedorId"
            name="proveedorId"
            required
            disabled={isEditing}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            value={formData.proveedorId}
            onChange={handleChange}
          >
            <option value="">Selecciona un proveedor</option>
            {proveedoresData?.proveedores?.map((proveedor) => (
              <option key={proveedor.id} value={proveedor.id}>
                {proveedor.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Detalles de la compra */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Detalles de la Compra</h3>
            {!isEditing && (
              <button
                type="button"
                onClick={addDetalle}
                className="flex items-center gap-2 px-3 py-1 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                <PlusIcon className="w-4 h-4" />
                Agregar Detalle
              </button>
            )}
          </div>

          <div className="space-y-4">
            {formData.detalles.map((detalle, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Producto
                    </label>
                    {isEditing ? (
                      <div className="w-full px-3 py-2 text-sm bg-gray-100 border border-gray-300 rounded-md shadow-sm sm:text-base">
                        {productosData?.productos?.find(p => p.id === detalle.productoId)?.nombre || `Producto #${detalle.productoId}`}
                      </div>
                    ) : (
                      <select
                        value={detalle.productoId}
                        onChange={(e) => handleDetalleChange(index, 'productoId', e.target.value)}
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Selecciona un producto</option>
                        {productosData?.productos?.map((producto) => (
                          <option key={producto.id} value={producto.id}>
                            {producto.nombre} - {producto.unidadMedida.abreviatura}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Cantidad
                    </label>
                    {isEditing ? (
                      <div className="w-full px-3 py-2 text-sm bg-gray-100 border border-gray-300 rounded-md shadow-sm sm:text-base">
                        {detalle.cantidad}
                      </div>
                    ) : (
                      <input
                        type="number"
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        value={detalle.cantidad}
                        onChange={(e) => handleDetalleChange(index, 'cantidad', e.target.value)}
                      />
                    )}
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Precio Unitario
                    </label>
                    {isEditing ? (
                      <div className="w-full px-3 py-2 text-sm bg-gray-100 border border-gray-300 rounded-md shadow-sm sm:text-base">
                        {new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(detalle.precioUnitario)}
                      </div>
                    ) : (
                      <input
                        type="number"
                        step="0.01"
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        value={detalle.precioUnitario}
                        onChange={(e) => handleDetalleChange(index, 'precioUnitario', e.target.value)}
                      />
                    )}
                  </div>
                </div>
                {!isEditing && formData.detalles.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDetalle(index)}
                    className="flex items-center gap-1 px-2 py-1 mt-2 text-sm text-red-600 hover:text-red-800"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Eliminar
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Estado de la compra */}
        {isEditing && compra && (
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Estado actual
            </label>
            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
              compra.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
              compra.estado === 'completada' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              {compra.estado.charAt(0).toUpperCase() + compra.estado.slice(1)}
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="flex flex-col gap-3 pt-4 mt-6 border-t sm:flex-row">
          <button
            type="submit"
            disabled={loadingCreate || loadingUpdate}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md sm:w-auto sm:text-base hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loadingCreate || loadingUpdate ? 'Guardando...' : isEditing ? 'Completar Compra' : 'Crear Compra'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/app/compras')}
            className="w-full px-4 py-2 text-sm font-medium text-center text-gray-700 bg-gray-100 rounded-md sm:w-auto sm:text-base hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
} 