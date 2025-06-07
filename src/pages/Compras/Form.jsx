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

  const { loading: loadingCompra, error: compraError, data: compraData } = useQuery(
    GET_COMPRA,
    {
      variables: { id: parseInt(id) },
      skip: !isEditing
    }
  );

  const [crearCompra, { loading: loadingCreate }] = useMutation(CREAR_COMPRA, {
    onCompleted: () => {
      toast.success('Compra creada correctamente');
      navigate('/app/compras');
    },
    onError: (error) => {
      toast.error(error.message);
    },
    refetchQueries: [{ query: GET_COMPRAS }]
  });

  const [actualizarCompra, { loading: loadingUpdate }] = useMutation(ACTUALIZAR_COMPRA, {
    onCompleted: () => {
      toast.success('Compra actualizada correctamente');
      navigate('/app/compras');
    },
    onError: (error) => {
      toast.error(error.message);
    },
    refetchQueries: [{ query: GET_COMPRAS }]
  });

  useEffect(() => {
    if (isEditing && compraData?.compra) {
      const { proveedorId, detalles } = compraData.compra;
      setFormData({
        proveedorId,
        detalles: detalles.map(({ productoId, cantidad, precioUnitario }) => ({
          productoId,
          cantidad,
          precioUnitario
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
      detalles: [
        ...prev.detalles,
        { productoId: '', cantidad: '', precioUnitario: '' }
      ]
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
    }
  };

  if (isEditing && loadingCompra) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (compraError) {
    return (
      <div className="p-4 text-center text-red-500">
        Error al cargar los datos de la compra: {compraError.message}
      </div>
    );
  }

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
            {proveedoresData?.proveedores.map((proveedor) => (
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
                      Producto ID
                    </label>
                    <input
                      type="number"
                      required
                      disabled={isEditing}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      value={detalle.productoId}
                      onChange={(e) => handleDetalleChange(index, 'productoId', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Cantidad
                    </label>
                    <input
                      type="number"
                      required
                      disabled={isEditing}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      value={detalle.cantidad}
                      onChange={(e) => handleDetalleChange(index, 'cantidad', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Precio Unitario
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      disabled={isEditing}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      value={detalle.precioUnitario}
                      onChange={(e) => handleDetalleChange(index, 'precioUnitario', e.target.value)}
                    />
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

        {/* Botones */}
        <div className="flex flex-col gap-3 pt-4 mt-6 border-t sm:flex-row">
          <button
            type="submit"
            disabled={loadingCreate || loadingUpdate}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md sm:w-auto sm:text-base hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loadingCreate || loadingUpdate ? 'Guardando...' : isEditing ? 'Actualizar Estado' : 'Crear Compra'}
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