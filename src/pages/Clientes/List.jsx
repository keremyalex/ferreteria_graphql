import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CLIENTES, DELETE_CLIENTE } from '../../graphql/clientes';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Card,
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableBody,
  Badge,
  Title,
} from '@tremor/react';
import { PencilIcon, TrashIcon, PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import TextInput from '../../components/TextInput';

const TIPO_CLIENTE_COLORS = {
  PARTICULAR: 'red',
  EMPRESA: 'blue',
  DISTRIBUIDOR: 'green'
};

const formatFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const ClientesList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data, loading, error } = useQuery(GET_CLIENTES);
  
  const [deleteCliente] = useMutation(DELETE_CLIENTE, {
    refetchQueries: [{ query: GET_CLIENTES }],
    onCompleted: () => {
      toast.success('Cliente eliminado correctamente');
    },
    onError: (error) => {
      toast.error(`Error al eliminar cliente: ${error.message}`);
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        Error al cargar los clientes: {error.message}
      </div>
    );
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este cliente?')) {
      try {
        await deleteCliente({ 
          variables: { 
            id: parseFloat(id) // Convertir a Float para la mutación
          } 
        });
      } catch (error) {
        console.error('Error al eliminar:', error);
      }
    }
  };

  const filteredClientes = data?.clientes.filter(cliente =>
    `${cliente.nombre} ${cliente.apellido} ${cliente.email} ${cliente.ci}`.toLowerCase()
    .includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <Title>Gestión de Clientes</Title>
        <Link 
          to="/app/clientes/crear"
          className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <PlusIcon className="w-5 h-5" />
          Nuevo Cliente
        </Link>
      </div>

      <div className="mb-6">
        <TextInput
          icon={MagnifyingGlassIcon}
          placeholder="Buscar por nombre, apellido, email o CI..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>CI</TableHeaderCell>
            <TableHeaderCell>Nombre</TableHeaderCell>
            <TableHeaderCell>Email</TableHeaderCell>
            <TableHeaderCell>Teléfono</TableHeaderCell>
            <TableHeaderCell>Dirección</TableHeaderCell>
            <TableHeaderCell>Tipo</TableHeaderCell>
            <TableHeaderCell>Fecha Registro</TableHeaderCell>
            <TableHeaderCell>Acciones</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredClientes.map((cliente) => (
            <TableRow key={cliente.id}>
              <TableCell>{cliente.ci}</TableCell>
              <TableCell>
                {cliente.nombre} {cliente.apellido}
              </TableCell>
              <TableCell>{cliente.email}</TableCell>
              <TableCell>{cliente.telefono}</TableCell>
              <TableCell>{cliente.direccion}</TableCell>
              <TableCell>
                <Badge color={TIPO_CLIENTE_COLORS[cliente.tipo_cliente]}>
                  {cliente.tipo_cliente === 'PARTICULAR' ? 'Particular' :
                   cliente.tipo_cliente === 'EMPRESA' ? 'Empresa' : 'Distribuidor'}
                </Badge>
              </TableCell>
              <TableCell>{formatFecha(cliente.fecha_registro)}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Link 
                    to={`/app/clientes/editar/${cliente.id}`}
                    className="flex items-center gap-1 px-3 py-1 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    <PencilIcon className="w-4 h-4" />
                    Editar
                  </Link>
                  <button 
                    onClick={() => handleDelete(cliente.id)}
                    className="flex items-center gap-1 px-3 py-1 text-red-600 bg-red-100 rounded hover:bg-red-200"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Eliminar
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default ClientesList;
