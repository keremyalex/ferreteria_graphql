import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PRODUCTOS, DELETE_PRODUCTO } from '../../graphql/productos';
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

const getStockTotal = (stocks) => {
  return stocks.reduce((total, stock) => total + stock.cantidad, 0);
};

const getStockEstado = (stocks) => {
  const total = getStockTotal(stocks);
  if (total <= 0) return 'AGOTADO';
  const algunBajoStock = stocks.some(stock => stock.estado === 'BAJO_STOCK');
  if (algunBajoStock) return 'BAJO_STOCK';
  return 'DISPONIBLE';
};

const ESTADO_STOCK_COLORS = {
  'DISPONIBLE': 'green',
  'BAJO_STOCK': 'yellow',
  'AGOTADO': 'red',
  'SOBRE_STOCK': 'blue'
};

export function ProductosList() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data, loading, error } = useQuery(GET_PRODUCTOS);
  
  const [deleteProducto] = useMutation(DELETE_PRODUCTO, {
    refetchQueries: [{ query: GET_PRODUCTOS }],
    onCompleted: () => {
      toast.success('Producto eliminado correctamente');
    },
    onError: (error) => {
      toast.error(`Error al eliminar producto: ${error.message}`);
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
      <div className="p-4 text-center text-red-500">
        Error al cargar los productos: {error.message}
      </div>
    );
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este producto?')) {
      try {
        await deleteProducto({ 
          variables: { 
            id: parseInt(id)
          } 
        });
      } catch (error) {
        console.error('Error al eliminar:', error);
      }
    }
  };

  const filteredProductos = data?.productos.filter(producto =>
    `${producto.nombre} ${producto.descripcion} ${producto.categoria.nombre}`.toLowerCase()
    .includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <Title>Gestión de Productos</Title>
        <Link 
          to="/app/productos/crear"
          className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <PlusIcon className="w-5 h-5" />
          Nuevo Producto
        </Link>
      </div>

      <div className="mb-6">
        <TextInput
          icon={MagnifyingGlassIcon}
          placeholder="Buscar por nombre, descripción o categoría..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Nombre</TableHeaderCell>
            <TableHeaderCell>Descripción</TableHeaderCell>
            <TableHeaderCell>Categoría</TableHeaderCell>
            <TableHeaderCell>Unidad</TableHeaderCell>
            <TableHeaderCell>Precio</TableHeaderCell>
            <TableHeaderCell>Stock</TableHeaderCell>
            <TableHeaderCell>Acciones</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredProductos.map((producto) => (
            <TableRow key={producto.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  {producto.urlImagen && (
                    <img 
                      src={producto.urlImagen} 
                      alt={producto.nombre}
                      className="object-cover w-10 h-10 rounded"
                    />
                  )}
                  <span>{producto.nombre}</span>
                </div>
              </TableCell>
              <TableCell>{producto.descripcion}</TableCell>
              <TableCell>
                <Badge color="blue">
                  {producto.categoria.nombre}
                </Badge>
              </TableCell>
              <TableCell>
                {producto.unidadMedida.nombre} ({producto.unidadMedida.abreviatura})
              </TableCell>
              <TableCell>
                {new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(producto.precio)}
              </TableCell>
              <TableCell>
                {producto.stocks.map(stock => (
                  <div key={stock.id} className="text-sm">
                    <Badge color={stock.cantidad > 0 ? 'green' : 'red'}>
                      {stock.cantidad} en {stock.almacen.nombre}
                    </Badge>
                  </div>
                ))}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/app/productos/editar/${producto.id}`}
                    className="p-1 text-blue-600 hover:text-blue-800"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(producto.id)}
                    className="p-1 text-red-600 hover:text-red-800"
                  >
                    <TrashIcon className="w-5 h-5" />
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