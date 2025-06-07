import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CATEGORIAS, DELETE_CATEGORIA } from '../../graphql/categorias';
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
  Title,
} from '@tremor/react';
import { PencilIcon, TrashIcon, PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import TextInput from '../../components/TextInput';

export function CategoriasList() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data, loading, error } = useQuery(GET_CATEGORIAS);
  
  const [deleteCategoria] = useMutation(DELETE_CATEGORIA, {
    refetchQueries: [{ query: GET_CATEGORIAS }],
    onCompleted: () => {
      toast.success('Categoría eliminada correctamente');
    },
    onError: (error) => {
      toast.error(`Error al eliminar categoría: ${error.message}`);
    }
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center">
        Error al cargar las categorías: {error.message}
      </div>
    );
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar esta categoría? Esta acción no se puede deshacer.')) {
      try {
        await deleteCategoria({ 
          variables: { id }
        });
      } catch (error) {
        console.error('Error al eliminar:', error);
      }
    }
  };

  const filteredCategorias = data?.categorias.filter(categoria =>
    `${categoria.nombre} ${categoria.descripcion || ''}`.toLowerCase()
    .includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <Title>Gestión de Categorías</Title>
        <Link 
          to="/app/categorias/crear"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Nueva Categoría
        </Link>
      </div>

      <div className="mb-6">
        <TextInput
          icon={MagnifyingGlassIcon}
          placeholder="Buscar por nombre o descripción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Nombre</TableHeaderCell>
            <TableHeaderCell>Descripción</TableHeaderCell>
            <TableHeaderCell>Acciones</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredCategorias.map((categoria) => (
            <TableRow key={categoria.id}>
              <TableCell className="font-medium">{categoria.nombre}</TableCell>
              <TableCell>{categoria.descripcion || '-'}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Link 
                    to={`/app/categorias/editar/${categoria.id}`}
                    className="px-3 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 flex items-center gap-1"
                  >
                    <PencilIcon className="h-4 w-4" />
                    Editar
                  </Link>
                  <button 
                    onClick={() => handleDelete(categoria.id)}
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
} 