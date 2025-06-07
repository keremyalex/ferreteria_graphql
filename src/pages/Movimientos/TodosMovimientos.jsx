import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_TODOS_MOVIMIENTOS, ANULAR_MOVIMIENTO } from '../../graphql/movimientos';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
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
import { MagnifyingGlassIcon, XCircleIcon, PlusIcon } from '@heroicons/react/24/outline';
import TextInput from '../../components/TextInput';
import { Modal } from '../../components/Modal';

const TIPO_MOVIMIENTO_COLORS = {
  ENTRADA: 'green',
  SALIDA: 'red',
  TRASLADO: 'blue',
  AJUSTE: 'yellow',
  DEVOLUCION: 'purple'
};

const ESTADO_MOVIMIENTO_COLORS = {
  ACTIVO: 'green',
  ANULADO: 'red'
};

export function TodosMovimientosList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMovimiento, setSelectedMovimiento] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [motivoAnulacion, setMotivoAnulacion] = useState('');

  const { data, loading, error, refetch } = useQuery(GET_TODOS_MOVIMIENTOS, {
    fetchPolicy: 'no-cache',
    onError: (error) => {
      console.error('Error en la consulta:', error);
      toast.error(`Error al cargar los movimientos: ${error.message}`);
    }
  });

  const [anularMovimiento] = useMutation(ANULAR_MOVIMIENTO, {
    onCompleted: () => {
      toast.success('Movimiento anulado correctamente');
      setIsModalOpen(false);
      setMotivoAnulacion('');
      refetch();
    },
    onError: (error) => {
      toast.error(`Error al anular movimiento: ${error.message}`);
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
      <Card>
        <div className="text-red-500 text-center p-4">
          <p className="font-bold">Error al cargar los movimientos</p>
          <p className="text-sm mt-2">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Intentar nuevamente
          </button>
        </div>
      </Card>
    );
  }

  const handleAnular = async () => {
    if (!motivoAnulacion.trim()) {
      toast.error('Debe ingresar un motivo de anulación');
      return;
    }

    try {
      await anularMovimiento({ 
        variables: { 
          id: selectedMovimiento.id,
          motivo: motivoAnulacion
        }
      });
    } catch (error) {
      console.error('Error al anular:', error);
    }
  };

  const handleShowAnularModal = (movimiento) => {
    if (movimiento.estado === 'ANULADO') {
      toast.warning('Este movimiento ya está anulado');
      return;
    }
    setSelectedMovimiento(movimiento);
    setIsModalOpen(true);
  };

  const filteredMovimientos = data?.todosLosMovimientos?.filter(movimiento =>
    `${movimiento.producto.nombre} ${movimiento.observaciones || ''}`.toLowerCase()
    .includes(searchTerm.toLowerCase())
  ) || [];

  // Ordenar movimientos por ID descendente
  const sortedMovimientos = [...filteredMovimientos].sort((a, b) => 
    parseInt(b.id) - parseInt(a.id)
  );

  return (
    <>
      <Card>
        <div className="flex justify-between items-center mb-6">
          <Title>Todos los Movimientos de Inventario</Title>
          <Link 
            to="/app/movimientos/crear"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Nuevo Movimiento
          </Link>
        </div>

        <div className="mb-6">
          <TextInput
            icon={MagnifyingGlassIcon}
            placeholder="Buscar por producto u observaciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Fecha</TableHeaderCell>
              <TableHeaderCell>Producto</TableHeaderCell>
              <TableHeaderCell>Tipo</TableHeaderCell>
              <TableHeaderCell>Cantidad</TableHeaderCell>
              <TableHeaderCell>Almacenes</TableHeaderCell>
              <TableHeaderCell>Estado</TableHeaderCell>
              <TableHeaderCell>Observaciones</TableHeaderCell>
              <TableHeaderCell>Acciones</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedMovimientos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                  No hay movimientos registrados
                </TableCell>
              </TableRow>
            ) : (
              sortedMovimientos.map((movimiento) => (
                <TableRow key={movimiento.id} className={movimiento.estado === 'ANULADO' ? 'bg-gray-50' : ''}>
                  <TableCell>{new Date(movimiento.fecha).toLocaleString()}</TableCell>
                  <TableCell className="font-medium">
                    {movimiento.producto.nombre}
                    <span className="text-xs text-gray-500 block">
                      {movimiento.producto.unidadMedida.abreviatura}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge color={TIPO_MOVIMIENTO_COLORS[movimiento.tipoMovimiento]}>
                      {movimiento.tipoMovimiento}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={movimiento.estado === 'ANULADO' ? 'line-through' : ''}>
                      {movimiento.cantidad}
                    </span>
                  </TableCell>
                  <TableCell>
                    {movimiento.tipoMovimiento === 'TRASLADO' ? (
                      <span>
                        {movimiento.almacenOrigen?.nombre} → {movimiento.almacenDestino?.nombre}
                      </span>
                    ) : movimiento.almacenOrigen ? (
                      <span>Desde: {movimiento.almacenOrigen.nombre}</span>
                    ) : movimiento.almacenDestino ? (
                      <span>Hacia: {movimiento.almacenDestino.nombre}</span>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge color={ESTADO_MOVIMIENTO_COLORS[movimiento.estado]}>
                      {movimiento.estado}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={movimiento.estado === 'ANULADO' ? 'line-through' : ''}>
                      {movimiento.observaciones || '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {movimiento.estado === 'ANULADO' ? (
                      <span className="text-gray-400 cursor-not-allowed">
                        <XCircleIcon className="h-5 w-5" />
                      </span>
                    ) : (
                      <button
                        onClick={() => handleShowAnularModal(movimiento)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Anular movimiento"
                      >
                        <XCircleIcon className="h-5 w-5" />
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setMotivoAnulacion('');
        }}
        title="Anular Movimiento"
      >
        <div className="space-y-4">
          <p>¿Está seguro que desea anular este movimiento?</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motivo de anulación
            </label>
            <textarea
              value={motivoAnulacion}
              onChange={(e) => setMotivoAnulacion(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Ingrese el motivo de la anulación..."
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setMotivoAnulacion('');
              }}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              onClick={handleAnular}
              className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
            >
              Anular
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
} 