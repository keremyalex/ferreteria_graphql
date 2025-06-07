import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_CLIENTE, UPDATE_CLIENTE, GET_CLIENTE, GET_CLIENTES } from '../../graphql/clientes';
import { toast } from 'react-toastify';

const TIPO_CLIENTE_OPTIONS = [
  { value: 'PARTICULAR', label: 'Particular' },
  { value: 'EMPRESA', label: 'Empresa' },
  { value: 'DISTRIBUIDOR', label: 'Distribuidor' },
];

export function ClienteForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const numericId = id ? parseInt(id) : null;

  console.log('ID del cliente:', numericId);
  console.log('isEditing:', isEditing);

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    ci: '',
    telefono: '',
    direccion: '',
    tipo_cliente: 'PARTICULAR',
  });

  const { data: clienteData, loading: loadingCliente, error: clienteError } = useQuery(GET_CLIENTE, {
    variables: { id: numericId },
    skip: !isEditing,
    onCompleted: (data) => {
      console.log('Datos recibidos del cliente:', data);
      if (data?.cliente) {
        setFormData({
          nombre: data.cliente.nombre || '',
          apellido: data.cliente.apellido || '',
          email: data.cliente.email || '',
          ci: data.cliente.ci || '',
          telefono: data.cliente.telefono || '',
          direccion: data.cliente.direccion || '',
          tipo_cliente: data.cliente.tipo_cliente || 'PARTICULAR',
        });
      }
    },
    onError: (error) => {
      console.error('Error al obtener cliente:', error);
      toast.error(`Error al cargar los datos del cliente: ${error.message}`);
    }
  });

  const [createCliente, { loading: loadingCreate }] = useMutation(CREATE_CLIENTE, {
    refetchQueries: [{ query: GET_CLIENTES }],
    onCompleted: () => {
      toast.success('Cliente creado correctamente');
      navigate('/app/clientes');
    },
    onError: (error) => {
      toast.error(`Error al crear cliente: ${error.message}`);
    },
  });

  const [updateCliente, { loading: loadingUpdate }] = useMutation(UPDATE_CLIENTE, {
    refetchQueries: [{ query: GET_CLIENTES }],
    onCompleted: () => {
      toast.success('Cliente actualizado correctamente');
      navigate('/app/clientes');
    },
    onError: (error) => {
      toast.error(`Error al actualizar cliente: ${error.message}`);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const mutationInput = {
        id: numericId,
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        ci: formData.ci,
        telefono: formData.telefono,
        direccion: formData.direccion,
        tipo_cliente: formData.tipo_cliente,
      };

      console.log('Enviando datos:', isEditing ? 'Actualización' : 'Creación', mutationInput);

      if (isEditing) {
        await updateCliente({
          variables: {
            updateClienteInput: mutationInput,
          },
        });
      } else {
        const { id, ...createInput } = mutationInput;
        await createCliente({
          variables: {
            createClienteInput: createInput,
          },
        });
      }
    } catch (error) {
      console.error('Error al guardar:', error);
      toast.error(`Error al ${isEditing ? 'actualizar' : 'crear'} cliente: ${error.message}`);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (isEditing && loadingCliente) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (clienteError) {
    return (
      <div className="p-4 text-center text-red-500">
        Error al cargar los datos del cliente: {clienteError.message}
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow sm:p-6">
      <h2 className="mb-6 text-xl font-bold text-gray-900 sm:text-2xl">
        {isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
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
              placeholder="Nombre del cliente"
              value={formData.nombre}
              onChange={handleChange}
            />
          </div>

          {/* Apellido */}
          <div>
            <label htmlFor="apellido" className="block mb-1 text-sm font-medium text-gray-700">
              Apellido
            </label>
            <input
              type="text"
              id="apellido"
              name="apellido"
              required
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Apellido del cliente"
              value={formData.apellido}
              onChange={handleChange}
            />
          </div>

          {/* CI */}
          <div>
            <label htmlFor="ci" className="block mb-1 text-sm font-medium text-gray-700">
              Cédula de Identidad
            </label>
            <input
              type="text"
              id="ci"
              name="ci"
              required
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Número de CI"
              value={formData.ci}
              onChange={handleChange}
            />
          </div>

          {/* Tipo de Cliente */}
          <div>
            <label htmlFor="tipo_cliente" className="block mb-1 text-sm font-medium text-gray-700">
              Tipo de Cliente
            </label>
            <select
              id="tipo_cliente"
              name="tipo_cliente"
              required
              className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              value={formData.tipo_cliente}
              onChange={handleChange}
            >
              {TIPO_CLIENTE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
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
              required
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="correo@ejemplo.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          {/* Teléfono */}
          <div>
            <label htmlFor="telefono" className="block mb-1 text-sm font-medium text-gray-700">
              Teléfono
            </label>
            <input
              type="text"
              id="telefono"
              name="telefono"
              required
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Número de teléfono"
              value={formData.telefono}
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
              required
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Dirección del cliente"
              value={formData.direccion}
              onChange={handleChange}
            />
          </div>

          {/* Botones */}
          <div className="flex flex-col gap-3 mt-4 md:col-span-2 sm:flex-row">
            <button
              type="submit"
              className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md sm:w-auto sm:text-base hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isEditing ? 'Guardar Cambios' : 'Crear Cliente'}
            </button>
            <Link
              to="/app/clientes"
              className="w-full px-4 py-2 text-sm font-medium text-center text-gray-700 bg-gray-100 rounded-md sm:w-auto sm:text-base hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancelar
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
} 