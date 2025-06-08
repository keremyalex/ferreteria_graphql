import { useQuery } from "@apollo/client";
import { useParams, Link } from "react-router-dom";
import { GET_FACTURA } from "../../graphql/ventas";
import { GET_PRODUCTOS } from "../../graphql/productos";

const VerFactura = () => {
    const { id } = useParams();
    
    const { data, loading, error } = useQuery(GET_FACTURA, {
        variables: { id: parseInt(id) }
    });

    const { data: productosData } = useQuery(GET_PRODUCTOS);
    const productos = productosData?.productos || [];

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
    );

    if (error) {
        console.error('Error al cargar la factura:', error);
        return (
            <div className="p-4 m-4 text-red-700 bg-red-100 border border-red-700 rounded">
                <p>Error al cargar la factura: {error.message}</p>
                <Link
                    to="/app/ventas"
                    className="inline-block px-4 py-2 mt-4 text-white bg-red-600 rounded hover:bg-red-700"
                >
                    Volver a Ventas
                </Link>
            </div>
        );
    }

    const { factura } = data;
    const { venta } = factura;

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
        <div className="p-8 bg-white">
            {/* Botón Volver */}
            <div className="mb-6">
                <Link
                    to={`/app/ventas/${venta.id}`}
                    className="px-4 py-2 text-gray-700 border rounded hover:bg-gray-50"
                >
                    ← Volver a la Venta
                </Link>
            </div>

            {/* Encabezado de la Factura */}
            <div className="mb-8 text-center">
                <h1 className="mb-2 text-3xl font-bold text-gray-800">FACTURA</h1>
                <p className="text-xl text-gray-600">N° {factura.numero}</p>
                <p className="text-gray-600">
                    Fecha: {new Date(factura.fecha).toLocaleDateString()}
                </p>
            </div>

            {/* Información del Cliente */}
            <div className="mb-8">
                <h2 className="mb-4 text-xl font-semibold text-gray-800">Información del Cliente</h2>
                <div className="p-4 rounded-lg bg-gray-50">
                    <p><span className="font-medium">Nombre:</span> {venta.cliente.nombre} {venta.cliente.apellido}</p>
                    <p><span className="font-medium">CI:</span> {venta.cliente.ci}</p>
                    <p><span className="font-medium">Email:</span> {venta.cliente.email}</p>
                    <p><span className="font-medium">Teléfono:</span> {venta.cliente.telefono}</p>
                    <p><span className="font-medium">Dirección:</span> {venta.cliente.direccion}</p>
                </div>
            </div>

            {/* Información de la Venta */}
            <div className="mb-6">
                <h2 className="mb-4 text-xl font-semibold text-gray-800">Detalles de la Venta</h2>
                <div className="p-4 mb-6 rounded-lg bg-gray-50">
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

                {/* Tabla de Productos */}
                <div className="overflow-x-auto">
                    <table className="w-full mb-6">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Producto</th>
                                <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Cantidad</th>
                                <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Precio Unit.</th>
                                <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {venta.detalles.map((detalle) => {
                                const productoInfo = getProductoInfo(detalle);
                                return (
                                    <tr key={detalle.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{productoInfo.nombre}</div>
                                            <div className="text-sm text-gray-500">{productoInfo.descripcion}</div>
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
                                <td className="px-6 py-4 font-medium">Bs. {factura.monto_total.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Pie de Factura */}
            <div className="pt-8 mt-12 text-center text-gray-600 border-t">
                <p>Gracias por su compra</p>
                <p className="text-sm">Este documento es una representación digital de su factura</p>
            </div>
        </div>
    );
};

export default VerFactura; 