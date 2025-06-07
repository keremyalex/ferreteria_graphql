import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_UNIDADES_MEDIDA, DELETE_UNIDAD_MEDIDA } from '../../graphql/unidadesMedida';
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
  Badge,
} from '@tremor/react';
import { PencilIcon, TrashIcon, PlusIcon, MagnifyingGlassIcon, ClipboardDocumentListIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import TextInput from '../../components/TextInput';
import { Modal } from '../../components/Modal';

function UnidadesMedidaList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnidad, setSelectedUnidad] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data, loading, error, refetch } = useQuery(GET_UNIDADES_MEDIDA, {
    fetchPolicy: 'network-only'
  });

  const [eliminarUnidadMedida] = useMutation(DELETE_UNIDAD_MEDIDA, {
    onCompleted: () => {
      toast.success('Unidad de medida eliminada correctamente');
      setShowDeleteModal(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`Error al eliminar unidad de medida: ${error.message}`);
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
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-red-500 text-center">
          <p className="font-bold">Error al cargar las unidades de medida</p>
          <p className="text-sm mt-2">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Intentar nuevamente
          </button>
        </div>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!selectedUnidad) return;

    try {
      await eliminarUnidadMedida({
        variables: { id: selectedUnidad.id }
      });
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
  };

  const handleShowDeleteModal = (unidad) => {
    if (unidad.productos?.length > 0) {
      toast.error('No se puede eliminar una unidad de medida que está siendo utilizada por productos');
      return;
    }
    setSelectedUnidad(unidad);
    setShowDeleteModal(true);
  };

  const filteredUnidades = data?.unidadesMedida.filter(unidad =>
    `${unidad.nombre} ${unidad.abreviatura}`.toLowerCase()
    .includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <>
      <Card>
        <div className="flex justify-between items-center mb-6">
          <Title>Gestión de Unidades de Medida</Title>
          <Link 
            to="/app/unidades-medida/crear"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Nueva Unidad de Medida
          </Link>
        </div>

        <div className="mb-6">
          <TextInput
            icon={MagnifyingGlassIcon}
            placeholder="Buscar por nombre o abreviatura..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Nombre</TableHeaderCell>
              <TableHeaderCell>Abreviatura</TableHeaderCell>
              <TableHeaderCell>Productos</TableHeaderCell>
              <TableHeaderCell>Acciones</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUnidades.map((unidad) => (
              <TableRow key={unidad.id}>
                <TableCell className="font-medium">{unidad.nombre}</TableCell>
                <TableCell>{unidad.abreviatura}</TableCell>
                <TableCell>
                  <div className="text-sm text-gray-500">
                    {unidad.productos?.length || 0} productos
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Link 
                      to={`/app/unidades-medida/editar/${unidad.id}`}
                      className="px-3 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 flex items-center gap-1"
                    >
                      <PencilSquareIcon className="h-4 w-4" />
                      Editar
                    </Link>
                    <button 
                      onClick={() => handleShowDeleteModal(unidad)}
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

      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedUnidad(null);
        }}
        title="Eliminar Unidad de Medida"
      >
        <div className="mt-2">
          <p className="text-gray-600">
            ¿Está seguro que desea eliminar la unidad de medida "{selectedUnidad?.nombre}"?
          </p>
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              setShowDeleteModal(false);
              setSelectedUnidad(null);
            }}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
          >
            Eliminar
          </button>
        </div>
      </Modal>
    </>
  );
}

export default UnidadesMedidaList; 