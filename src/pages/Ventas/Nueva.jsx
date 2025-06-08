import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { CREAR_VENTA, CREAR_DETALLE_VENTA, GET_CLIENTES, GET_PRODUCTOS } from "../../graphql/ventas";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Select from 'react-select/async';

const NuevaVenta = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [clienteId, setClienteId] = useState("");
    const [metodoPago, setMetodoPago] = useState("EFECTIVO");
    const [detalles, setDetalles] = useState([
        { productoId: "", productoNombre: "", cantidad: 1, precioUnitario: 0 }
    ]);

    // Consultas para obtener clientes y productos
    const { data: clientesData } = useQuery(GET_CLIENTES);
    const { data: productosData } = useQuery(GET_PRODUCTOS);
    const clientes = clientesData?.clientes || [];
    const productos = productosData?.productos || [];

    const [crearVenta] = useMutation(CREAR_VENTA, {
        onCompleted: async (data) => {
            // Crear los detalles de la venta
            try {
                for (const detalle of detalles) {
                    if (detalle.productoId && detalle.cantidad > 0) {
                        await crearDetalleVenta({
                            variables: {
                                ventaId: Number(data.crearVenta.id),
                                productoId: Number(detalle.productoId),
                                cantidad: Number(detalle.cantidad),
                                precioUnitario: Number(detalle.precioUnitario)
                            }
                        });
                    }
                }
                navigate(`/app/ventas/${data.crearVenta.id}`);
            } catch (error) {
                console.error("Error al crear los detalles de la venta:", error);
            }
        },
        onError: (error) => {
            console.error("Error al crear la venta:", error);
        }
    });

    const [crearDetalleVenta] = useMutation(CREAR_DETALLE_VENTA, {
        onError: (error) => {
            console.error("Error al crear detalle de venta:", error);
        }
    });

    // Función para cargar opciones de clientes para el Select
    const loadClienteOptions = (inputValue) => {
        const filteredOptions = clientes
            .filter(cliente => 
                inputValue === "" || // Mostrar todos si no hay búsqueda
                `${cliente.nombre} ${cliente.apellido} (${cliente.ci})`
                .toLowerCase()
                .includes(inputValue.toLowerCase())
            )
            .map(cliente => ({
                value: cliente.id,
                label: `${cliente.nombre} ${cliente.apellido} (${cliente.ci})`
            }));
        return Promise.resolve(filteredOptions);
    };

    // Función para cargar opciones de productos para el Select
    const loadProductoOptions = (inputValue) => {
        const filteredOptions = productos
            .filter(producto => 
                inputValue === "" || // Mostrar todos si no hay búsqueda
                producto.nombre.toLowerCase().includes(inputValue.toLowerCase())
            )
            .map(producto => ({
                value: producto.id,
                label: producto.nombre,
                precio: producto.precio
            }));
        return Promise.resolve(filteredOptions);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Calcular el total de la venta
        const total = detalles.reduce((sum, detalle) => {
            return sum + (Number(detalle.cantidad) * Number(detalle.precioUnitario));
        }, 0);

        try {
            await crearVenta({
                variables: {
                    clienteId: Number(clienteId),
                    vendedorId: user.id,
                    total: Number(total),
                    estado: "PENDIENTE",
                    metodoPago
                }
            });
        } catch (error) {
            console.error("Error al crear la venta:", error);
        }
    };

    const handleProductoChange = async (selectedOption, index) => {
        const producto = productos.find(p => p.id === selectedOption.value);
        const newDetalles = [...detalles];
        newDetalles[index] = {
            ...newDetalles[index],
            productoId: selectedOption.value,
            productoNombre: selectedOption.label,
            precioUnitario: producto.precio
        };
        setDetalles(newDetalles);
    };

    const handleDetalleChange = (index, field, value) => {
        const newDetalles = [...detalles];
        newDetalles[index] = {
            ...newDetalles[index],
            [field]: value
        };
        setDetalles(newDetalles);
    };

    const addDetalle = () => {
        setDetalles([
            ...detalles,
            { productoId: "", productoNombre: "", cantidad: 1, precioUnitario: 0 }
        ]);
    };

    const removeDetalle = (index) => {
        if (detalles.length > 1) {
            setDetalles(detalles.filter((_, i) => i !== index));
        }
    };

    const calcularSubtotal = (detalle) => {
        return detalle.cantidad * detalle.precioUnitario;
    };

    const calcularTotal = () => {
        return detalles.reduce((total, detalle) => total + calcularSubtotal(detalle), 0);
    };

    return (
        <div className="p-6 bg-white rounded shadow">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">Nueva Venta</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Cliente
                        </label>
                        <Select
                            cacheOptions
                            defaultOptions={clientes.map(cliente => ({
                                value: cliente.id,
                                label: `${cliente.nombre} ${cliente.apellido} (${cliente.ci})`
                            }))}
                            loadOptions={loadClienteOptions}
                            onChange={(option) => setClienteId(option.value)}
                            placeholder="Seleccionar cliente..."
                            className="text-sm"
                            required
                            noOptionsMessage={() => "No se encontraron clientes"}
                            loadingMessage={() => "Cargando clientes..."}
                        />
                    </div>
                    
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Vendedor
                        </label>
                        <input
                            type="text"
                            value={user?.email || ''}
                            className="w-full px-3 py-2 bg-gray-100 border rounded focus:outline-none"
                            disabled
                        />
                    </div>
                    
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Método de Pago
                        </label>
                        <select
                            value={metodoPago}
                            onChange={(e) => setMetodoPago(e.target.value)}
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="EFECTIVO">Efectivo</option>
                            <option value="TARJETA">Tarjeta</option>
                            <option value="TRANSFERENCIA">Transferencia</option>
                        </select>
                    </div>
                </div>

                <div className="mt-6">
                    <h3 className="mb-4 text-lg font-medium text-gray-700">Detalles de la Venta</h3>
                    
                    {detalles.map((detalle, index) => (
                        <div key={index} className="p-4 mb-4 border rounded">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700">
                                        Producto
                                    </label>
                                    <Select
                                        cacheOptions
                                        defaultOptions={productos.map(producto => ({
                                            value: producto.id,
                                            label: producto.nombre,
                                            precio: producto.precio
                                        }))}
                                        loadOptions={loadProductoOptions}
                                        onChange={(option) => handleProductoChange(option, index)}
                                        placeholder="Seleccionar producto..."
                                        className="text-sm"
                                        required
                                        noOptionsMessage={() => "No se encontraron productos"}
                                        loadingMessage={() => "Cargando productos..."}
                                    />
                                </div>
                                
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700">
                                        Cantidad
                                    </label>
                                    <input
                                        type="number"
                                        value={detalle.cantidad}
                                        onChange={(e) => handleDetalleChange(index, "cantidad", e.target.value)}
                                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        min="1"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700">
                                        Precio Unitario
                                    </label>
                                    <input
                                        type="number"
                                        value={detalle.precioUnitario}
                                        className="w-full px-3 py-2 bg-gray-100 border rounded focus:outline-none"
                                        disabled
                                    />
                                </div>
                            </div>
                            
                            <div className="flex justify-between mt-2">
                                <div className="text-sm text-gray-600">
                                    Subtotal: Bs. {calcularSubtotal(detalle).toFixed(2)}
                                </div>
                                
                                {detalles.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeDetalle(index)}
                                        className="text-sm text-red-600 hover:text-red-800"
                                    >
                                        Eliminar
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    
                    <div className="flex justify-between items-center">
                        <button
                            type="button"
                            onClick={addDetalle}
                            className="px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                        >
                            + Agregar Producto
                        </button>
                        
                        <div className="text-lg font-medium">
                            Total: Bs. {calcularTotal().toFixed(2)}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4 mt-6">
                    <button
                        type="button"
                        onClick={() => navigate("/app/ventas")}
                        className="px-4 py-2 text-gray-700 border rounded hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                    >
                        Crear Venta
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NuevaVenta; 