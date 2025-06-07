import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_MOVIMIENTO, GET_TODOS_MOVIMIENTOS } from '../../graphql/movimientos';
import { GET_PRODUCTOS } from '../../graphql/productos';
import { GET_ALMACENES } from '../../graphql/almacenes';
import { toast } from 'react-toastify';

const TIPO_MOVIMIENTO = {
    ENTRADA: 'ENTRADA',
    SALIDA: 'SALIDA',
    TRASLADO: 'TRASLADO',
    AJUSTE: 'AJUSTE',
    DEVOLUCION: 'DEVOLUCION'
};

const TIPO_MOVIMIENTO_INFO = {
    ENTRADA: 'Ingreso de productos al inventario (compras, devoluciones de clientes)',
    SALIDA: 'Salida de productos del inventario (ventas, mermas)',
    TRASLADO: 'Movimiento de productos entre almacenes',
    AJUSTE: 'Corrección de inventario (diferencias en conteo físico)',
    DEVOLUCION: 'Devolución de productos a proveedores'
};

export function MovimientoForm() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        productoId: '',
        tipoMovimiento: '',
        cantidad: '',
        almacenOrigenId: '',
        almacenDestinoId: '',
        observaciones: ''
    });

    const { data: productosData, loading: loadingProductos } = useQuery(GET_PRODUCTOS);
    const { data: almacenesData, loading: loadingAlmacenes } = useQuery(GET_ALMACENES);

    const [registrarMovimiento] = useMutation(CREATE_MOVIMIENTO, {
        onCompleted: () => {
            toast.success('Movimiento registrado correctamente');
            navigate('/app/movimientos/todos');
        },
        onError: (error) => {
            toast.error(`Error al registrar movimiento: ${error.message}`);
        },
        refetchQueries: [
            { query: GET_TODOS_MOVIMIENTOS }
        ]
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.productoId || !formData.tipoMovimiento || !formData.cantidad) {
            toast.error('Por favor complete los campos obligatorios');
            return;
        }

        if (formData.cantidad <= 0) {
            toast.error('La cantidad debe ser mayor a 0');
            return;
        }

        // Validaciones específicas por tipo de movimiento
        switch (formData.tipoMovimiento) {
            case TIPO_MOVIMIENTO.ENTRADA:
                if (!formData.almacenDestinoId) {
                    toast.error('Debe seleccionar un almacén destino para la entrada');
                    return;
                }
                break;
            case TIPO_MOVIMIENTO.SALIDA:
                if (!formData.almacenOrigenId) {
                    toast.error('Debe seleccionar un almacén origen para la salida');
                    return;
                }
                break;
            case TIPO_MOVIMIENTO.TRASLADO:
                if (!formData.almacenOrigenId || !formData.almacenDestinoId) {
                    toast.error('Debe seleccionar almacén origen y destino para el traslado');
                    return;
                }
                if (formData.almacenOrigenId === formData.almacenDestinoId) {
                    toast.error('El almacén origen y destino no pueden ser el mismo');
                    return;
                }
                break;
        }

        const input = {
            productoId: formData.productoId,
            tipoMovimiento: formData.tipoMovimiento,
            cantidad: parseFloat(formData.cantidad),
            observaciones: formData.observaciones || undefined
        };

        // Agregar almacenes según el tipo de movimiento
        if (formData.almacenOrigenId) {
            input.almacenOrigenId = formData.almacenOrigenId;
        }
        if (formData.almacenDestinoId) {
            input.almacenDestinoId = formData.almacenDestinoId;
        }

        try {
            await registrarMovimiento({
                variables: { input }
            });
        } catch (error) {
            console.error('Error al registrar movimiento:', error);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: value };
            
            // Limpiar campos de almacenes al cambiar el tipo de movimiento
            if (field === 'tipoMovimiento') {
                newData.almacenOrigenId = '';
                newData.almacenDestinoId = '';
            }
            
            return newData;
        });
    };

    if (loadingProductos || loadingAlmacenes) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Registrar Movimiento de Inventario</h2>
            <p className="text-gray-500 mb-6">Complete la información del movimiento. Los campos marcados con * son obligatorios.</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Producto *
                        <span className="text-gray-500 text-xs ml-1">(Seleccione el producto a mover)</span>
                    </label>
                    <select
                        value={formData.productoId}
                        onChange={(e) => handleChange('productoId', e.target.value)}
                        className="mt-1 block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                        <option value="">Seleccione un producto</option>
                        {productosData?.productos?.map((producto) => (
                            <option key={producto.id} value={producto.id}>
                                {`${producto.nombre} - ${producto.unidadMedida.abreviatura}`}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Movimiento *
                        <span className="text-gray-500 text-xs ml-1">(Seleccione el tipo de operación)</span>
                    </label>
                    <select
                        value={formData.tipoMovimiento}
                        onChange={(e) => handleChange('tipoMovimiento', e.target.value)}
                        className="mt-1 block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                        <option value="">Seleccione el tipo de movimiento</option>
                        {Object.entries(TIPO_MOVIMIENTO).map(([key, value]) => (
                            <option key={key} value={value}>
                                {key}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cantidad *
                        <span className="text-gray-500 text-xs ml-1">(Ingrese la cantidad a mover)</span>
                    </label>
                    <input
                        type="number"
                        value={formData.cantidad}
                        onChange={(e) => handleChange('cantidad', e.target.value)}
                        placeholder="Ej: 10.5"
                        min="0"
                        step="0.01"
                        className="mt-1 block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="font-medium text-gray-900 mb-2">Información de Almacenes</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        {formData.tipoMovimiento === TIPO_MOVIMIENTO.ENTRADA && "Para ingresos, seleccione el almacén donde se recibirá el producto."}
                        {formData.tipoMovimiento === TIPO_MOVIMIENTO.SALIDA && "Para salidas, seleccione el almacén de donde se retirará el producto."}
                        {formData.tipoMovimiento === TIPO_MOVIMIENTO.TRASLADO && "Para traslados, seleccione tanto el almacén de origen como el de destino."}
                        {!formData.tipoMovimiento && "Seleccione primero el tipo de movimiento para ver las opciones de almacén."}
                    </p>

                    {(formData.tipoMovimiento === TIPO_MOVIMIENTO.SALIDA || 
                      formData.tipoMovimiento === TIPO_MOVIMIENTO.TRASLADO) && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Almacén Origen *
                                <span className="text-gray-500 text-xs ml-1">(Desde dónde sale el producto)</span>
                            </label>
                            <select
                                value={formData.almacenOrigenId}
                                onChange={(e) => handleChange('almacenOrigenId', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            >
                                <option value="">Seleccione el almacén origen</option>
                                {almacenesData?.almacenes?.map((almacen) => (
                                    <option key={almacen.id} value={almacen.id}>
                                        {`${almacen.nombre} - ${almacen.ubicacion}`}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {(formData.tipoMovimiento === TIPO_MOVIMIENTO.ENTRADA || 
                      formData.tipoMovimiento === TIPO_MOVIMIENTO.TRASLADO) && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Almacén Destino *
                                <span className="text-gray-500 text-xs ml-1">(Hacia dónde va el producto)</span>
                            </label>
                            <select
                                value={formData.almacenDestinoId}
                                onChange={(e) => handleChange('almacenDestinoId', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            >
                                <option value="">Seleccione el almacén destino</option>
                                {almacenesData?.almacenes?.map((almacen) => (
                                    <option key={almacen.id} value={almacen.id}>
                                        {`${almacen.nombre} - ${almacen.ubicacion}`}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Observaciones
                        <span className="text-gray-500 text-xs ml-1">(Información adicional del movimiento)</span>
                    </label>
                    <textarea
                        value={formData.observaciones}
                        onChange={(e) => handleChange('observaciones', e.target.value)}
                        placeholder="Ej: Ingreso por compra #123, Salida por venta #456, Traslado entre sucursales, etc."
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={() => navigate('/app/movimientos/todos')}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Registrar Movimiento
                    </button>
                </div>
            </form>
        </div>
    );
} 