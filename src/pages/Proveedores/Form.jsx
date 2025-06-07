import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import { 
  CREAR_PROVEEDOR, 
  ACTUALIZAR_PROVEEDOR, 
  GET_PROVEEDOR, 
  GET_PROVEEDORES 
} from '../../graphql/proveedores';
import { toast } from 'react-toastify';

export function ProveedorForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    nombre: '',
    nit: '',
    direccion: '',
    telefono: '',
    email: ''
  });

  const { loading: loadingProveedor, error: proveedorError, data: proveedorData } = useQuery(
    GET_PROVEEDOR,
    {
      variables: { id: parseInt(id) },
      skip: !isEditing
    }
  );

  const [crearProveedor, { loading: loadingCreate }] = useMutation(CREAR_PROVEEDOR, {
    onCompleted: () => {
      toast.success('Proveedor creado correctamente');
      navigate('/app/proveedores');
    },
    onError: (error) => {
      toast.error(error.message);
    },
    refetchQueries: [{ query: GET_PROVEEDORES }]
  });

  const [actualizarProveedor, { loading: loadingUpdate }] = useMutation(ACTUALIZAR_PROVEEDOR, {
    onCompleted: () => {
      toast.success('Proveedor actualizado correctamente');
      navigate('/app/proveedores');
    },
    onError: (error) => {
      toast.error(error.message);
    },
    refetchQueries: [{ query: GET_PROVEEDORES }]
  });

  useEffect(() => {
    if (isEditing && proveedorData?.proveedor?.proveedor) {
      const { nombre, nit, direccion, telefono, email } = proveedorData.proveedor.proveedor;
      setFormData({ nombre, nit, direccion, telefono, email });
    }
  }, [isEditing, proveedorData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (isEditing) {
        const input = { ...formData };
        delete input.nit; // El NIT no se puede actualizar
        await actualizarProveedor({
          variables: {
            id: parseInt(id),
            input
          }
        });
      } else {
        await crearProveedor({
          variables: {
            input: formData
          }
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (isEditing && loadingProveedor) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (proveedorError) {
    return (
      <div className="p-4 text-center text-red-500">
        Error al cargar los datos del proveedor: {proveedorError.message}
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow sm:p-6">
      <h2 className="mb-6 text-xl font-bold text-gray-900 sm:text-2xl">
        {isEditing ? 'Editar Proveedor' : 'Nuevo Proveedor'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 sm:gap-6">
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
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nombre del proveedor"
              value={formData.nombre}
              onChange={handleChange}
            />
          </div>

          {/* NIT */}
          <div>
            <label htmlFor="nit" className="block mb-1 text-sm font-medium text-gray-700">
              NIT
            </label>
            <input
              type="text"
              id="nit"
              name="nit"
              required={!isEditing}
              disabled={isEditing}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              placeholder="NIT del proveedor"
              value={formData.nit}
              onChange={handleChange}
            />
          </div>

          {/* Teléfono */}
          <div>
            <label htmlFor="telefono" className="block mb-1 text-sm font-medium text-gray-700">
              Teléfono
            </label>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Teléfono del proveedor"
              value={formData.telefono}
              onChange={handleChange}
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="correo@ejemplo.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          {/* Dirección */}
          <div className="md:col-span-2">
            <label htmlFor="direccion" className="block mb-1 text-sm font-medium text-gray-700">
              Dirección
            </label>
            <input
              type="text"
              id="direccion"
              name="direccion"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Dirección del proveedor"
              value={formData.direccion}
              onChange={handleChange}
            />
          </div>

          {/* Botones */}
          <div className="flex flex-col gap-3 mt-4 md:col-span-2 sm:flex-row">
            <button
              type="submit"
              disabled={loadingCreate || loadingUpdate}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md sm:w-auto sm:text-base hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loadingCreate || loadingUpdate ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Proveedor'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/app/proveedores')}
              className="w-full px-4 py-2 text-sm font-medium text-center text-gray-700 bg-gray-100 rounded-md sm:w-auto sm:text-base hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancelar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
} 