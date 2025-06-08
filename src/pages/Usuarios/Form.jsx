import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import {
  Card,
  Title,
  TextInput,
  Button
} from "@tremor/react";

const GET_USER = gql`
  query GetUser($id: String!) {
    user(id: $id) {
      id
      email
      role
    }
  }
`;

const CREATE_USER = gql`
  mutation CreateUser($createUserInput: CreateUserInput!) {
    createUser(createUserInput: $createUserInput) {
      id
      email
      role
    }
  }
`;

const UPDATE_USER = gql`
  mutation UpdateUser($updateUserInput: UpdateUserInput!) {
    updateUser(updateUserInput: $updateUserInput) {
      id
      email
      role
    }
  }
`;

const roles = [
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'VENDEDOR', label: 'Vendedor' },
  { value: 'ALMACENISTA', label: 'Almacenista' }
];

export const UsuarioForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'VENDEDOR'
  });

  const { data: userData, loading: userLoading } = useQuery(GET_USER, {
    variables: { id },
    skip: !isEditing
  });

  const [createUser] = useMutation(CREATE_USER, {
    onCompleted: () => navigate('/app/usuarios')
  });

  const [updateUser] = useMutation(UPDATE_USER, {
    onCompleted: () => navigate('/app/usuarios')
  });

  useEffect(() => {
    if (userData?.user) {
      setFormData({
        email: userData.user.email,
        password: '',
        role: userData.user.role
      });
    }
  }, [userData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        const updateInput = {
          id,
          ...formData,
          ...(formData.password ? { password: formData.password } : {})
        };
        await updateUser({
          variables: { updateUserInput: updateInput }
        });
      } else {
        await createUser({
          variables: { createUserInput: formData }
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Card>
      <Title>{isEditing ? 'Editar Usuario' : 'Crear Usuario'}</Title>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Email
          </label>
          <TextInput
            type="email"
            placeholder="correo@ejemplo.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Contraseña {isEditing && '(dejar en blanco para mantener la actual)'}
          </label>
          <TextInput
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required={!isEditing}
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Rol
          </label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="block w-full px-3 py-2 mt-1 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            {roles.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/app/usuarios')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isEditing ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </form>
    </Card>
  );
}; 