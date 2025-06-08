import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ALMACENES, DELETE_ALMACEN } from '../../graphql/almacenes';
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
import { PencilIcon, TrashIcon, PlusIcon, MagnifyingGlassIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import TextInput from '../../components/TextInput';
import { Modal } from '../../components/Modal';

const ESTADO_STOCK_COLORS = {
  DISPONIBLE: 'green',
  AGOTADO: 'red',
  BAJO_STOCK: 'yellow',
  SOBRE_STOCK: 'blue'
};

export function AlmacenesList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlmacen, setSelectedAlmacen] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data, loading, error } = useQuery(GET_ALMACENES);
  
  const [deleteAlmacen] = useMutation(DELETE_ALMACEN, {
    refetchQueries: [{ query: GET_ALMACENES }],
    onCompleted: () => {
      toast.success('Almacén eliminado correctamente');
    },
    onError: (error) => {
      toast.error(`Error al eliminar almacén: ${error.message}`);
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
        Error al cargar los almacenes: {error.message}
      </div>
    );
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este almacén? Esta acción no se puede deshacer.')) {
      try {
        await deleteAlmacen({ 
          variables: { id }
        });
      } catch (error) {
        console.error('Error al eliminar:', error);
      }
    }
  };

  const handleShowStock = (almacen) => {
    setSelectedAlmacen(almacen);
    setIsModalOpen(true);
  };

  const filteredAlmacenes = data?.almacenes.filter(almacen =>
    `${almacen.nombre} ${almacen.ubicacion}`.toLowerCase()
    .includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <>
      <Card>
        <div className="flex items-center justify-between mb-6">
          <Title>Gestión de Almacenes</Title>
          <Link 
            to="/app/almacenes/crear"
            className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="w-5 h-5" />
            Nuevo Almacén
          </Link>
        </div>

        <div className="mb-6">
          <TextInput
            icon={MagnifyingGlassIcon}
            placeholder="Buscar por nombre o ubicación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Nombre</TableHeaderCell>
              <TableHeaderCell>Ubicación</TableHeaderCell>
              <TableHeaderCell>Stock</TableHeaderCell>
              <TableHeaderCell>Acciones</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAlmacenes.map((almacen) => (
              <TableRow key={almacen.id}>
                <TableCell className="font-medium">{almacen.nombre}</TableCell>
                <TableCell>{almacen.ubicacion}</TableCell>
                <TableCell>
                  <button
                    onClick={() => handleShowStock(almacen)}
                    className="inline-flex items-center px-3 py-1 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    <ClipboardDocumentListIcon className="w-4 h-4 mr-1" />
                    Ver Stock ({almacen.stocks?.length || 0})
                  </button>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Link 
                      to={`/app/almacenes/editar/${almacen.id}`}
                      className="flex items-center gap-1 px-3 py-1 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                    >
                      <PencilIcon className="w-4 h-4" />
                      Editar
                    </Link>
                    <button 
                      onClick={() => handleDelete(almacen.id)}
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Stock en Almacén: ${selectedAlmacen?.nombre}`}
      >
        <div className="space-y-4">
          {selectedAlmacen?.stocks.length === 0 ? (
            <p className="italic text-center text-gray-500">No hay productos en stock en este almacén</p>
          ) : (
            <div className="divide-y divide-gray-200">
              {selectedAlmacen?.stocks.map(stock => (
                <div key={stock.id} className="py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{stock.producto.nombre}</h4>
                      <Badge color={ESTADO_STOCK_COLORS[stock.estado]} className="mt-1">
                        {stock.cantidad} unidades - {stock.estado}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
} 