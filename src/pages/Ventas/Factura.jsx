import { useQuery } from "@apollo/client";
import { useParams, Link, useNavigate } from "react-router-dom";
import { GET_VENTA, GET_FACTURAS } from "../../graphql/ventas";
import { GET_PRODUCTOS } from "../../graphql/productos";
import { useEffect } from "react";
import { toast } from "react-toastify";

const Factura = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const { data, loading, error } = useQuery(GET_VENTA, {
        variables: { id: parseInt(id) },
        onError: (error) => {
            toast.error(`Error al cargar la venta: ${error.message}`);
            navigate('/app/ventas');
        }
    });

    const { data: facturasData } = useQuery(GET_FACTURAS, {
        onError: (error) => {
            console.error('Error al cargar facturas:', error);
        }
    });

    const { data: productosData } = useQuery(GET_PRODUCTOS);
    const productos = productosData?.productos || [];

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
    );

    if (error) return (
        <div className="p-4 m-4 text-red-700 bg-red-100 border border-red-700 rounded">
            <p>Error: {error.message}</p>
            <Link to="/app/ventas" className="inline-block px-4 py-2 mt-4 text-white bg-red-600 rounded hover:bg-red-700">
                Volver a Ventas
            </Link>
        </div>
    );

    const venta = data?.venta;
    if (!venta) {
        return (
            <div className="p-4 m-4 text-red-700 bg-red-100 border border-red-700 rounded">
                <p>Error: No se encontró la venta</p>
                <Link to="/app/ventas" className="inline-block px-4 py-2 mt-4 text-white bg-red-600 rounded hover:bg-red-700">
                    Volver a Ventas
                </Link>
            </div>
        );
    }

    if (!venta.cliente) {
        return (
            <div className="p-4 m-4 text-red-700 bg-red-100 border border-red-700 rounded">
                <p>Error: La venta no tiene un cliente asociado</p>
                <Link to="/app/ventas" className="inline-block px-4 py-2 mt-4 text-white bg-red-600 rounded hover:bg-red-700">
                    Volver a Ventas
                </Link>
            </div>
        );
    }

    const factura = facturasData?.facturas?.find(f => f.venta?.id === venta.id);

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

    return (
        <div className="p-6 space-y-6">
            {/* Encabezado */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        Factura #{factura?.numero || 'N/A'}
                    </h2>
                    <p className="text-gray-600">
                        Fecha: {new Date(factura?.fecha || venta.fecha).toLocaleString()}
                    </p>
                </div>
                <div className="flex gap-4">
                    <Link
                        to={`/app/ventas/${venta.id}`}
                        className="px-4 py-2 text-gray-700 border rounded hover:bg-gray-50"
                    >
                        Volver a la Venta
                    </Link>
                </div>
            </div>

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
                            <span className={`px-2 py-1 text-sm rounded ${
                                venta.estado === "PENDIENTE"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : venta.estado === "COMPLETADA"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                            }`}>
                                {venta.estado}
                            </span>
                        </p>
                        <p>
                            <span className="font-medium">Método de Pago: </span>
                            <span className="px-2 py-1 text-sm text-blue-800 bg-blue-100 rounded">
                                {venta.metodo_pago}
                            </span>
                        </p>
                        <p><span className="font-medium">Fecha de Venta:</span> {new Date(venta.fecha).toLocaleString()}</p>
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

            {/* Pie de Factura */}
            <div className="p-4 text-center text-gray-600 bg-white rounded shadow">
                <p>Gracias por su compra</p>
                <p className="text-sm">Este documento es una representación digital de su factura</p>
            </div>
        </div>
    );
};

export default Factura; 