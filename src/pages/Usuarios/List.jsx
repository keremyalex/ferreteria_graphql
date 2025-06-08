import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import {
  Card,
  Title,
  Text,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Badge,
  TextInput
} from "@tremor/react";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline";

const GET_USERS = gql`
  query GetUsers {
    users {
      id
      email
      role
    }
  }
`;

const REMOVE_USER = gql`
  mutation RemoveUser($id: String!) {
    removeUser(id: $id)
  }
`;

const getRoleBadgeColor = (role) => {
  switch (role) {
    case 'ADMIN':
      return 'red';
    case 'VENDEDOR':
      return 'blue';
    case 'ALMACENISTA':
      return 'green';
    default:
      return 'gray';
  }
};

export const UsuariosList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data, loading, error } = useQuery(GET_USERS);
  const [removeUser] = useMutation(REMOVE_USER, {
    refetchQueries: [{ query: GET_USERS }]
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error: {error.message}
      </div>
    );
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este usuario?')) {
      try {
        await removeUser({
          variables: { id }
        });
      } catch (error) {
        console.error('Error al eliminar:', error);
      }
    }
  };

  const filteredUsers = data?.users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <Title>Gestión de Usuarios</Title>
        <Link 
          to="/app/usuarios/crear"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Nuevo Usuario
        </Link>
      </div>

      <div className="mb-6">
        <TextInput
          icon={MagnifyingGlassIcon}
          placeholder="Buscar por email o rol..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Email</TableHeaderCell>
            <TableHeaderCell>Rol</TableHeaderCell>
            <TableHeaderCell>Acciones</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge color={getRoleBadgeColor(user.role)}>
                  {user.role}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Link 
                    to={`/app/usuarios/editar/${user.id}`}
                    className="px-3 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 flex items-center gap-1"
                  >
                    <PencilSquareIcon className="h-4 w-4" />
                    Editar
                  </Link>
                  <button 
                    onClick={() => handleDelete(user.id)}
                    className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 flex items-center gap-1"
                  >
                    <TrashIcon className="h-4 w-4" />
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