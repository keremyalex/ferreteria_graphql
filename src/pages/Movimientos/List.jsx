import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_MOVIMIENTOS, ANULAR_MOVIMIENTO } from '../../graphql/movimientos';
import { GET_PRODUCTOS } from '../../graphql/productos';
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
  Select,
  SelectItem,
} from '@tremor/react';
import { PlusIcon, MagnifyingGlassIcon, XCircleIcon } from '@heroicons/react/24/outline';
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

export function MovimientosList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductoId, setSelectedProductoId] = useState('');
  const [selectedMovimiento, setSelectedMovimiento] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [motivoAnulacion, setMotivoAnulacion] = useState('');

  const { data: productosData, loading: loadingProductos } = useQuery(GET_PRODUCTOS);
  const { data, loading, error, refetch } = useQuery(GET_MOVIMIENTOS, {
    variables: selectedProductoId ? { productoId: selectedProductoId } : {},
    fetchPolicy: 'network-only',
    onError: (error) => {
      console.error('Error en la consulta:', error);
      if (error.networkError) {
        console.error('Network error:', error.networkError);
        toast.error('Error de conexión con el servidor');
      } else if (error.graphQLErrors) {
        error.graphQLErrors.forEach((err) => {
          console.error('GraphQL error:', err);
          toast.error(`Error: ${err.message}`);
        });
      } else {
        toast.error('Error al cargar los movimientos');
      }
    }
  });

  useEffect(() => {
    refetch();
  }, [selectedProductoId]);

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

  if (loading || loadingProductos) {
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

  const filteredMovimientos = data?.movimientosInventario?.filter(movimiento =>
    movimiento.observaciones?.toLowerCase().includes(searchTerm.toLowerCase()) || false
  ) || [];

  return (
    <>
      <Card>
        <div className="flex justify-between items-center mb-6">
          <Title>Movimientos de Inventario</Title>
          <Link 
            to="/app/movimientos/crear"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Nuevo Movimiento
          </Link>
        </div>

        <div className="mb-6 space-y-4">
          <Select
            value={selectedProductoId}
            onValueChange={setSelectedProductoId}
            placeholder="Filtrar por producto"
          >
            <SelectItem value="">Todos los productos</SelectItem>
            {productosData?.productos?.map((producto) => (
              <SelectItem key={producto.id} value={producto.id}>
                {producto.nombre}
              </SelectItem>
            ))}
          </Select>

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
            {filteredMovimientos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                  No hay movimientos registrados
                </TableCell>
              </TableRow>
            ) : (
              filteredMovimientos.map((movimiento) => (
                <TableRow key={movimiento.id}>
                  <TableCell>{new Date(movimiento.fecha).toLocaleString()}</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>
                    <Badge color={TIPO_MOVIMIENTO_COLORS[movimiento.tipoMovimiento]}>
                      {movimiento.tipoMovimiento}
                    </Badge>
                  </TableCell>
                  <TableCell>{movimiento.cantidad}</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>
                    <Badge color={ESTADO_MOVIMIENTO_COLORS[movimiento.estado]}>
                      {movimiento.estado}
                    </Badge>
                  </TableCell>
                  <TableCell>{movimiento.observaciones || '-'}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleShowAnularModal(movimiento)}
                      disabled={movimiento.estado === 'ANULADO'}
                      className="text-red-600 hover:text-red-800 disabled:text-gray-400"
                    >
                      <XCircleIcon className="h-5 w-5" />
                    </button>
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
          <p className="text-gray-600">
            ¿Está seguro que desea anular este movimiento? Esta acción no se puede deshacer.
          </p>
          <TextInput
            label="Motivo de anulación"
            value={motivoAnulacion}
            onChange={(e) => setMotivoAnulacion(e.target.value)}
            placeholder="Ingrese el motivo de la anulación"
            required
          />
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setMotivoAnulacion('');
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleAnular}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Anular Movimiento
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
} 