import { useQuery, useMutation } from "@apollo/client";
import { useParams, useNavigate, Link } from "react-router-dom";
import { GET_VENTA, ACTUALIZAR_VENTA, CREAR_FACTURA, GET_FACTURAS } from "../../graphql/ventas";
import { GET_PRODUCTOS } from "../../graphql/productos";
import { REGISTRAR_MOVIMIENTO } from "../../graphql/inventario";
import { useState } from "react";
import { toast } from "react-toastify";

const DetalleVenta = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [creandoFactura, setCreandoFactura] = useState(false);
    
    const { data, loading, error, refetch } = useQuery(GET_VENTA, {
        variables: { id: parseInt(id) }
    });

    const { data: facturasData } = useQuery(GET_FACTURAS, {
        onError: (error) => {
            console.error('Error al cargar facturas:', error);
        }
    });

    const { data: productosData } = useQuery(GET_PRODUCTOS);
    const productos = productosData?.productos || [];

    const [actualizarVenta] = useMutation(ACTUALIZAR_VENTA);
    const [registrarMovimiento] = useMutation(REGISTRAR_MOVIMIENTO);

    const [crearFactura] = useMutation(CREAR_FACTURA, {
        onCompleted: async (data) => {
            try {
                // Primero actualizamos el estado de la venta a COMPLETADA
                await actualizarVenta({
                    variables: {
                        id: parseInt(id),
                        input: {
                            estado: "COMPLETADA"
                        }
                    }
                });

                // Después registramos los movimientos de inventario
                for (const detalle of venta.detalles) {
                    await registrarMovimiento({
                        variables: {
                            input: {
                                productoId: detalle.producto_id,
                                tipoMovimiento: "SALIDA",
                                cantidad: detalle.cantidad,
                                almacenOrigenId: detalle.almacen_id,
                                observaciones: `Venta #${id} completada`
                            }
                        }
                    });
                }

                toast.success("Factura generada y stock actualizado exitosamente");
                setCreandoFactura(false);
                refetch();

                // Redirigir a la página de la factura
                setTimeout(() => {
                    navigate(`/app/ventas/${id}/factura`);
                }, 500);
            } catch (error) {
                console.error("Error:", error);
                toast.error("Error al procesar la operación");
                setCreandoFactura(false);
            }
        }
    });

    const handleEstadoChange = async (nuevoEstado) => {
        try {
            await actualizarVenta({
                variables: {
                    id: parseInt(id),
                    estado: nuevoEstado
                }
            });
        } catch (error) {
            console.error("Error al actualizar el estado:", error);
        }
    };

    const handleCrearFactura = async () => {
        setCreandoFactura(true);
        try {
            await crearFactura({
                variables: {
                    ventaId: parseInt(id),
                    montoTotal: data.venta.total
                }
            });
        } catch (error) {
            console.error("Error al crear factura:", error);
            toast.error("Error al crear la factura");
            setCreandoFactura(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
    );

    if (error) return (
        <div className="p-4 m-4 text-red-700 bg-red-100 border border-red-700 rounded">
            <p>Error: {error.message}</p>
        </div>
    );

    const venta = data.venta;
    console.log('Detalles de venta:', venta.detalles);

    const estadoColorClass = {
        PENDIENTE: "bg-yellow-100 text-yellow-800",
        COMPLETADA: "bg-green-100 text-green-800",
        CANCELADA: "bg-red-100 text-red-800"
    }[venta.estado];

    const getProductoInfo = (detalle) => {
        const producto = productos.find(p => p.id === String(detalle.producto_id));
        if (producto) {
            return {
                nombre: producto.nombre,
                descripcion: `${producto.descripcion} - ${producto.unidadMedida?.abreviatura || ''}`
            };
        }
        return {
            nombre: `Producto #${detalle.producto_id}`,
            descripcion: 'Sin descripción'
        };
    };

    const facturaExistente = facturasData?.facturas?.find(
        f => f.venta?.id === String(venta.id)
    );

    return (
        <div className="p-6 space-y-6">
            {/* Encabezado */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        Venta #{venta.id}
                    </h2>
                    <p className="text-gray-600">
                        Fecha: {new Date(venta.fecha).toLocaleString()}
                    </p>
                </div>
                <div className="flex gap-4">
                    {facturaExistente ? (
                        <Link
                            to={`/app/ventas/${venta.id}/factura`}
                            className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700"
                        >
                            Ver Factura #{facturaExistente.numero}
                        </Link>
                    ) : (
                        <button
                            onClick={() => setCreandoFactura(true)}
                            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                        >
                            Generar Factura
                        </button>
                    )}
                    <Link
                        to="/app/ventas"
                        className="px-4 py-2 text-gray-700 border rounded hover:bg-gray-50"
                    >
                        Volver
                    </Link>
                </div>
            </div>

            {/* Modal de confirmación para crear factura */}
            {creandoFactura && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
                        <h3 className="mb-4 text-xl font-bold">Generar Factura</h3>
                        <div className="mb-4 text-gray-600">
                            <p>¿Está seguro que desea generar una factura para esta venta?</p>
                            <div className="p-4 mt-4 rounded bg-gray-50">
                                <p className="font-medium">Resumen:</p>
                                <ul className="mt-2 space-y-1">
                                    {venta.detalles.map((detalle, index) => (
                                        <li key={index} className="text-sm">
                                            {`${detalle.cantidad} x Bs. ${detalle.precio_unitario.toFixed(2)} = Bs. ${detalle.subtotal.toFixed(2)}`}
                                        </li>
                                    ))}
                                </ul>
                                <p className="pt-3 mt-3 font-medium border-t">
                                    Monto total: Bs. {venta.total.toFixed(2)}
                                </p>
                            </div>
                            {venta.estado !== "COMPLETADA" && (
                                <div className="p-4 mt-4 text-yellow-800 rounded bg-yellow-50">
                                    <p>Nota: Al generar la factura, el estado de la venta cambiará a COMPLETADA.</p>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setCreandoFactura(false)}
                                className="px-4 py-2 text-gray-700 border rounded hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={async () => {
                                    if (venta.estado !== "COMPLETADA") {
                                        await actualizarVenta({
                                            variables: {
                                                id: parseInt(id),
                                                estado: "COMPLETADA"
                                            }
                                        });
                                    }
                                    handleCrearFactura();
                                }}
                                className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Información Principal */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="p-4 bg-white rounded shadow">
                    <h3 className="mb-4 text-lg font-medium">Información del Cliente</h3>
                    <div className="space-y-2">
                        <p>
                            <span className="font-medium">Nombre:</span> {venta.cliente.nombre} {venta.cliente.apellido}
                        </p>
                        <p><span className="font-medium">CI:</span> {venta.cliente.ci}</p>
                        <p><span className="font-medium">Email:</span> {venta.cliente.email}</p>
                        <p><span className="font-medium">Teléfono:</span> {venta.cliente.telefono}</p>
                        <p><span className="font-medium">Dirección:</span> {venta.cliente.direccion}</p>
                    </div>
                </div>

                <div className="p-4 bg-white rounded shadow">
                    <h3 className="mb-4 text-lg font-medium">Información de la Venta</h3>
                    <div className="space-y-2">
                        <p>
                            <span className="font-medium">Estado: </span>
                            <select
                                value={venta.estado}
                                onChange={(e) => handleEstadoChange(e.target.value)}
                                className={`px-2 py-1 ml-2 border rounded ${estadoColorClass}`}
                            >
                                <option value="PENDIENTE" className="text-yellow-800 bg-yellow-100">Pendiente</option>
                                <option value="COMPLETADA" className="text-green-800 bg-green-100">Completada</option>
                                <option value="CANCELADA" className="text-red-800 bg-red-100">Cancelada</option>
                            </select>
                        </p>
                        <p>
                            <span className="font-medium">Método de Pago:</span>{" "}
                            <span className="px-2 py-1 text-sm text-blue-800 bg-blue-100 rounded">
                                {venta.metodo_pago}
                            </span>
                        </p>
                        <p><span className="font-medium">Total:</span> Bs. {venta.total.toFixed(2)}</p>
                        <p><span className="font-medium">Fecha de Registro:</span> {new Date(venta.created_at).toLocaleString()}</p>
                        {venta.updated_at && (
                            <p><span className="font-medium">Última Actualización:</span> {new Date(venta.updated_at).toLocaleString()}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Detalles de la Venta */}
            <div className="bg-white rounded shadow">
                <div className="p-4 border-b">
                    <h3 className="text-lg font-medium">Detalles de la Venta</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Producto</th>
                                <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Cantidad</th>
                                <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Precio Unitario</th>
                                <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {venta.detalles.map((detalle) => {
                                console.log('Detalle individual:', detalle);
                                const productoInfo = getProductoInfo(detalle);
                                return (
                                    <tr key={detalle.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">
                                                {productoInfo.nombre}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {productoInfo.descripcion}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{detalle.cantidad}</td>
                                        <td className="px-6 py-4">Bs. {detalle.precio_unitario.toFixed(2)}</td>
                                        <td className="px-6 py-4">Bs. {detalle.subtotal.toFixed(2)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot className="bg-gray-50">
                            <tr>
                                <td colSpan="3" className="px-6 py-4 font-medium text-right">Total:</td>
                                <td className="px-6 py-4 font-medium">Bs. {venta.total.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Notas */}
            {venta.notas && (
                <div className="p-4 bg-white rounded shadow">
                    <h3 className="mb-2 text-lg font-medium">Notas</h3>
                    <p className="text-gray-600">{venta.notas}</p>
                </div>
            )}
        </div>
    );
};

export default DetalleVenta; 