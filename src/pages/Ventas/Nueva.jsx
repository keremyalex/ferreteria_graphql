import { useState, useEffect } from "react";
import { useMutation, useQuery, useApolloClient } from "@apollo/client";
import { CREAR_VENTA, CREAR_DETALLE_VENTA, GET_CLIENTES } from "../../graphql/ventas";
import { GET_PRODUCTOS } from "../../graphql/productos";
import { GET_ALMACENES } from "../../graphql/almacenes";
import { GET_STOCK_PRODUCTO, REGISTRAR_MOVIMIENTO, REFRESCAR_STOCK } from "../../graphql/inventario";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Select from 'react-select/async';
import { toast } from "react-toastify";

const NuevaVenta = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const client = useApolloClient();
    const [clienteId, setClienteId] = useState("");
    const [metodoPago, setMetodoPago] = useState("");
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [detalles, setDetalles] = useState([
        { 
            productoId: "", 
            productoNombre: "", 
            cantidad: 1, 
            precioUnitario: 0,
            almacenId: "",
            almacenNombre: "",
            stockDisponible: 0
        }
    ]);

    // Consultas para obtener clientes, productos y almacenes
    const { data: clientesData } = useQuery(GET_CLIENTES);
    const { data: productosData } = useQuery(GET_PRODUCTOS);
    const { data: almacenesData } = useQuery(GET_ALMACENES);
    const { data: stockData, loading: stockLoading, error: stockError } = useQuery(GET_STOCK_PRODUCTO, {
        variables: { id: selectedProductId },
        skip: !selectedProductId,
        fetchPolicy: 'network-only',
        onCompleted: (data) => {
            console.log('Stock Query Completed:', data);
            console.log('Producto completo:', data.producto);
        },
        onError: (error) => {
            console.error('Stock Query Error:', error);
        }
    });

    // Estado para almacenar las opciones de almacén
    const [almacenOptions, setAlmacenOptions] = useState([]);

    useEffect(() => {
        if (stockData?.producto?.stocks) {
            console.log('Stock Data Changed:', stockData);
            const options = stockData.producto.stocks
                .filter(stock => stock.cantidad > 0 && stock.estado === 'DISPONIBLE')
                .map(stock => ({
                    value: stock.almacen.id,
                    label: `${stock.almacen.nombre} (Stock: ${stock.cantidad})`,
                    stockDisponible: stock.cantidad
                }));
            console.log('Opciones de almacén actualizadas:', options);
            setAlmacenOptions(options);
        }
    }, [stockData]);

    const clientes = clientesData?.clientes || [];
    const productos = productosData?.productos || [];
    const almacenes = almacenesData?.almacenes || [];

    // Función para cargar opciones de almacenes
    const loadAlmacenOptions = async (inputValue) => {
        console.log('LoadAlmacenOptions called with:', {
            selectedProductId,
            stockData,
            inputValue,
            almacenOptions
        });

        if (!almacenOptions.length) {
            console.log('No hay opciones de almacén disponibles');
            return Promise.resolve([]);
        }

        const filteredOptions = almacenOptions.filter(option => 
            !inputValue || 
            option.label.toLowerCase().includes(inputValue.toLowerCase())
        );

        console.log('Opciones filtradas:', filteredOptions);
        return Promise.resolve(filteredOptions);
    };

    const [crearDetalleVenta] = useMutation(CREAR_DETALLE_VENTA, {
        onError: (error) => {
            console.error("Error al crear detalle de venta:", error);
            toast.error(`Error al crear detalle: ${error.message}`);
        }
    });

    const [registrarMovimiento] = useMutation(REGISTRAR_MOVIMIENTO, {
        onCompleted: async (data) => {
            console.log("Movimiento registrado exitosamente:", data);
            // Refrescar el stock del producto después del movimiento
            if (selectedProductId) {
                try {
                    await client.query({
                        query: REFRESCAR_STOCK,
                        variables: { id: selectedProductId },
                        fetchPolicy: 'network-only'
                    });
                } catch (error) {
                    console.error("Error al refrescar stock:", error);
                }
            }
        },
        onError: (error) => {
            console.error("Error al registrar movimiento:", error);
            toast.error(`Error al registrar movimiento: ${error.message}`);
        }
    });

    const [crearVenta] = useMutation(CREAR_VENTA, {
        onCompleted: (data) => {
            console.log("Venta base creada exitosamente:", data);
        },
        onError: (error) => {
            console.error("Error al crear la venta:", error);
            toast.error(`Error al crear la venta: ${error.message}`);
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
                label: producto.nombre
            }));
        return Promise.resolve(filteredOptions);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!clienteId) {
            toast.error("Por favor seleccione un cliente");
            return;
        }

        if (!metodoPago) {
            toast.error("Por favor seleccione un método de pago");
            return;
        }

        if (detalles.length === 0 || !detalles[0].productoId) {
            toast.error("Por favor agregue al menos un producto");
            return;
        }

        // Validar que todos los detalles tengan almacén seleccionado y stock suficiente
        for (const detalle of detalles) {
            if (!detalle.almacenId) {
                toast.error("Por favor seleccione un almacén para todos los productos");
                return;
            }
            if (detalle.cantidad > detalle.stockDisponible) {
                toast.error(`No hay suficiente stock para ${detalle.productoNombre} en el almacén seleccionado`);
                return;
            }
        }

        // Calcular el total de la venta
        const total = detalles.reduce((sum, detalle) => {
            return sum + (Number(detalle.cantidad) * Number(detalle.precioUnitario));
        }, 0);

        try {
            console.log("Iniciando creación de venta...");
            // Crear la venta
            const ventaResponse = await crearVenta({
                variables: {
                    clienteId: Number(clienteId),
                    vendedorId: user.id,
                    total: Number(total),
                    estado: "PENDIENTE",
                    metodoPago: metodoPago
                }
            });

            console.log("Venta creada:", ventaResponse.data);

            // Crear los detalles y registrar los movimientos
            for (const detalle of detalles) {
                if (detalle.productoId && detalle.cantidad > 0 && detalle.almacenId) {
                    console.log("Procesando detalle:", detalle);
                    
                    try {
                        // Crear el detalle de la venta
                        const detalleResponse = await crearDetalleVenta({
                            variables: {
                                ventaId: Number(ventaResponse.data.crearVenta.id),
                                productoId: Number(detalle.productoId),
                                cantidad: Number(detalle.cantidad),
                                precioUnitario: Number(detalle.precioUnitario),
                                almacenId: Number(detalle.almacenId)
                            }
                        });

                        console.log("Detalle creado:", detalleResponse.data);

                        // Registrar el movimiento de salida
                        const movimientoInput = {
                            productoId: String(detalle.productoId),
                            tipoMovimiento: "SALIDA",
                            cantidad: Number(detalle.cantidad),
                            almacenOrigenId: String(detalle.almacenId),
                            observaciones: `Venta #${ventaResponse.data.crearVenta.id}`
                        };

                        console.log("Intentando registrar movimiento con input:", movimientoInput);

                        const movimientoResponse = await registrarMovimiento({
                            variables: {
                                input: movimientoInput
                            }
                        });
                        console.log("Movimiento registrado:", movimientoResponse.data);

                        // Refrescar el stock después de registrar el movimiento
                        await client.query({
                            query: REFRESCAR_STOCK,
                            variables: { id: detalle.productoId },
                            fetchPolicy: 'network-only'
                        });
                    } catch (error) {
                        console.error("Error procesando detalle:", error);
                        toast.error(`Error al procesar detalle: ${error.message}`);
                        throw error;
                    }
                }
            }

            toast.success("Venta creada exitosamente");
            navigate(`/app/ventas/${ventaResponse.data.crearVenta.id}`);
        } catch (error) {
            console.error("Error al crear la venta:", error);
            toast.error(`Error al crear la venta: ${error.message}`);
        }
    };

    const handleProductoChange = async (selectedOption, index) => {
        console.log('Producto changed:', selectedOption);
        const producto = productos.find(p => p.id === selectedOption.value);
        setSelectedProductId(selectedOption.value);
        setAlmacenOptions([]); // Resetear las opciones de almacén
        
        const newDetalles = [...detalles];
        newDetalles[index] = {
            ...newDetalles[index],
            productoId: selectedOption.value,
            productoNombre: selectedOption.label,
            precioUnitario: producto.precio, // Usar el precio base del producto
            almacenId: "",
            almacenNombre: "",
            stockDisponible: 0,
            cantidad: 1
        };
        setDetalles(newDetalles);
    };

    const handleAlmacenChange = (selectedOption, index) => {
        console.log('Almacen changed:', selectedOption);
        const newDetalles = [...detalles];
        newDetalles[index] = {
            ...newDetalles[index],
            almacenId: selectedOption.value,
            almacenNombre: selectedOption.label.split(" (Stock:")[0],
            stockDisponible: selectedOption.stockDisponible
        };
        setDetalles(newDetalles);
    };

    const handleDetalleChange = (index, field, value) => {
        const newDetalles = [...detalles];
        newDetalles[index] = {
            ...newDetalles[index],
            [field]: value
        };

        // Validar stock al cambiar cantidad
        if (field === "cantidad" && value > newDetalles[index].stockDisponible) {
            toast.warning("La cantidad excede el stock disponible");
        }

        setDetalles(newDetalles);
    };

    const addDetalle = () => {
        setDetalles([
            ...detalles,
            { 
                productoId: "", 
                productoNombre: "", 
                cantidad: 1, 
                precioUnitario: 0,
                almacenId: "",
                almacenNombre: "",
                stockDisponible: 0
            }
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
                            Método de Pago
                        </label>
                        <select
                            value={metodoPago}
                            onChange={(e) => setMetodoPago(e.target.value)}
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">Seleccionar método de pago...</option>
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
                                            label: producto.nombre
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

                                {detalle.productoId && (
                                    <>
                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-gray-700">
                                                Almacén
                                            </label>
                                            <Select
                                                key={`almacen-select-${detalle.productoId}-${stockData ? 'loaded' : 'loading'}`}
                                                cacheOptions
                                                defaultOptions={almacenOptions}
                                                loadOptions={loadAlmacenOptions}
                                                onChange={(option) => handleAlmacenChange(option, index)}
                                                placeholder={stockLoading ? "Cargando almacenes..." : "Seleccionar almacén..."}
                                                className="text-sm"
                                                required
                                                isLoading={stockLoading}
                                                noOptionsMessage={() => {
                                                    if (stockError) return "Error al cargar el stock";
                                                    if (stockLoading) return "Cargando almacenes...";
                                                    if (!almacenOptions.length) return "No hay stock disponible";
                                                    return "No se encontraron almacenes";
                                                }}
                                                value={detalle.almacenId ? {
                                                    value: detalle.almacenId,
                                                    label: `${detalle.almacenNombre} (Stock: ${detalle.stockDisponible})`
                                                } : null}
                                            />
                                            {stockLoading && (
                                                <p className="mt-1 text-sm text-gray-500">
                                                    Cargando información de stock...
                                                </p>
                                            )}
                                            {stockError && (
                                                <p className="mt-1 text-sm text-red-500">
                                                    Error al cargar el stock: {stockError.message}
                                                </p>
                                            )}
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
                                                max={detalle.stockDisponible}
                                                required
                                            />
                                            {detalle.stockDisponible > 0 && (
                                                <p className="mt-1 text-sm text-gray-500">
                                                    Stock disponible: {detalle.stockDisponible}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-gray-700">
                                                Precio Unitario
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={detalle.precioUnitario}
                                                onChange={(e) => handleDetalleChange(index, "precioUnitario", e.target.value)}
                                                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-gray-700">
                                                Subtotal
                                            </label>
                                            <input
                                                type="number"
                                                value={calcularSubtotal(detalle)}
                                                className="w-full px-3 py-2 bg-gray-100 border rounded focus:outline-none"
                                                disabled
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                            
                            {detalles.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeDetalle(index)}
                                    className="mt-2 text-red-600 hover:text-red-800"
                                >
                                    Eliminar
                                </button>
                            )}
                        </div>
                    ))}
                    
                    <button
                        type="button"
                        onClick={addDetalle}
                        className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700"
                    >
                        Agregar Producto
                    </button>
                </div>

                <div className="flex items-center justify-between mt-6">
                    <div className="text-xl font-bold">
                        Total: Bs. {calcularTotal().toFixed(2)}
                    </div>
                    
                    <div className="flex gap-4">
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
                </div>
            </form>
        </div>
    );
};

export default NuevaVenta; 