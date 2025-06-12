import { Card, Title, Text, Tab, TabList, TabGroup, TabPanels, TabPanel, Grid } from "@tremor/react";
import { BarChart, LineChart, DonutChart } from "@tremor/react";
import { useState, useMemo } from "react";
import { useQuery } from "@apollo/client";
import { GET_DASHBOARD_DATA, GET_PRODUCTOS_MAS_VENDIDOS, GET_PRODUCTOS_NOMBRES } from "../graphql/Dashboard";

// Funciones de utilidad para manejo de fechas
const formatearFecha = (fecha) => {
  const date = new Date(fecha);
  return date.toISOString().split('T')[0];
};

const compararFechas = (fecha, desde, hasta) => {
  // Convertir todas las fechas a timestamps para comparación
  const fechaTimestamp = new Date(fecha).getTime();
  const desdeDate = new Date(desde);
  const hastaDate = new Date(hasta);
  
  // Establecer las horas para desde (inicio del día) y hasta (fin del día)
  desdeDate.setHours(0, 0, 0, 0);
  hastaDate.setHours(23, 59, 59, 999);

  return fechaTimestamp >= desdeDate.getTime() && fechaTimestamp <= hastaDate.getTime();
};

const agruparPorFecha = (movimientos) => {
  const grupos = {};
  
  movimientos.forEach(mov => {
    const fecha = formatearFecha(mov.fecha);
    if (!grupos[fecha]) {
      grupos[fecha] = {
        fecha: fecha,
        cantidad: 0
      };
    }
    grupos[fecha].cantidad += Number(mov.cantidad) || 0;
  });

  // Convertir a array y ordenar por fecha
  return Object.values(grupos).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
};

export const Dashboard = () => {
  const [tipoFiltro, setTipoFiltro] = useState("PERIODO"); // "PERIODO" o "RANGO"
  const [periodoVentas, setPeriodoVentas] = useState("ULTIMOS_30_DIAS");
  const [fechaInicio, setFechaInicio] = useState(formatearFecha(new Date(new Date().setDate(new Date().getDate() - 30))));
  const [fechaFin, setFechaFin] = useState(formatearFecha(new Date()));

  const { data: dashboardData, loading: dashboardLoading } = useQuery(GET_DASHBOARD_DATA);
  
  const { data: productosMasVendidosData, loading: productosMasVendidosLoading } = useQuery(GET_PRODUCTOS_MAS_VENDIDOS, {
    variables: {
      filtro: tipoFiltro === "PERIODO" 
        ? { tipo: periodoVentas }
        : { 
            tipo: "RANGO",
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin
          },
      limite: 5
    }
  });

  const { data: productosData } = useQuery(GET_PRODUCTOS_NOMBRES);

  // Crear un mapa de IDs a nombres de productos
  const productosMap = useMemo(() => {
    if (!productosData?.productos) return new Map();
    return new Map(productosData.productos.map(p => [p.id, p.nombre]));
  }, [productosData]);

  // Procesamiento de datos para los gráficos
  const procesarDatos = () => {
    const datosVacios = {
      movimientosPorDia: [],
      productosPopulares: [],
      productosMasVendidos: [],
      stockBajo: [],
      totalMovimientos: 0,
      totalProductos: 0,
      valorInventario: 0,
      entradasPorDia: [],
      salidasPorDia: []
    };

    if (!dashboardData?.productos || !dashboardData?.todosLosMovimientos) {
      return datosVacios;
    }

    try {
      // Filtrar movimientos por rango de fechas
      const movimientosFiltrados = dashboardData.todosLosMovimientos
        .filter(mov => mov && mov.fecha && mov.producto)
        .filter(mov => compararFechas(mov.fecha, fechaInicio, fechaFin) && mov.estado === 'ACTIVO');

      // Agrupar entradas y salidas por fecha
      const movimientosEntrada = movimientosFiltrados.filter(mov => mov.tipoMovimiento === 'ENTRADA');
      const movimientosSalida = movimientosFiltrados.filter(mov => mov.tipoMovimiento === 'SALIDA');

      const entradasPorDia = agruparPorFecha(movimientosEntrada.map(mov => ({
        ...mov,
        cantidad: Math.abs(Number(mov.cantidad))
      })));
      const salidasPorDia = agruparPorFecha(movimientosSalida.map(mov => ({
        ...mov,
        cantidad: Math.abs(Number(mov.cantidad))
      })));

      // Datos para gráfico de movimientos por día
      const movimientosPorDia = agruparPorFecha(movimientosFiltrados.map(mov => ({
        ...mov,
        cantidad: mov.tipoMovimiento === 'SALIDA' ? -Number(mov.cantidad) : Number(mov.cantidad)
      })));

      // Productos más movidos (todos los movimientos)
      const productosPopulares = movimientosFiltrados
        .reduce((acc, mov) => {
          const existente = acc.find(p => p.producto === mov.producto.nombre);
          if (existente) {
            existente.cantidad += Math.abs(Number(mov.cantidad)) || 0;
          } else {
            acc.push({
              producto: mov.producto.nombre,
              cantidad: Math.abs(Number(mov.cantidad)) || 0
            });
          }
          return acc;
        }, [])
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 5);

      // Productos más vendidos (solo salidas)
      const productosMasVendidos = movimientosSalida
        .reduce((acc, mov) => {
          const cantidad = Math.round(Number(mov.cantidad)) || 0;
          if (cantidad <= 0) return acc; // Ignorar movimientos con cantidad 0 o negativa
          
          const existente = acc.find(p => p.producto === mov.producto.nombre);
          if (existente) {
            existente.cantidad += cantidad;
            existente.valor += (cantidad * Number(mov.producto.precio)) || 0;
          } else {
            acc.push({
              producto: mov.producto.nombre,
              cantidad: cantidad,
              valor: (cantidad * Number(mov.producto.precio)) || 0
            });
          }
          return acc;
        }, [])
        .filter(item => item.cantidad > 0) // Filtrar productos con cantidad mayor a 0
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 5);

      // Productos con stock bajo
      const stockBajo = dashboardData.productos
        .filter(producto => producto && producto.nombre && Array.isArray(producto.stocks))
        .map(producto => {
          const stockTotal = producto.stocks.reduce((total, stock) => {
            return total + (Number(stock?.cantidad) || 0);
          }, 0);
          return {
            nombre: producto.nombre,
            stock: stockTotal,
            valor: stockTotal * (Number(producto.precio) || 0)
          };
        })
        .filter(producto => producto.stock < 10)
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 5);

      // Cálculos totales
      const totalMovimientos = movimientosFiltrados.length;
      const totalProductos = dashboardData.productos.length;
      const valorInventario = dashboardData.productos
        .filter(producto => producto && producto.precio && Array.isArray(producto.stocks))
        .reduce((total, producto) => {
          const stockTotal = producto.stocks.reduce((sum, stock) => {
            return sum + (Number(stock?.cantidad) || 0);
          }, 0);
          return total + (stockTotal * (Number(producto.precio) || 0));
        }, 0);

      return {
        movimientosPorDia,
        productosPopulares,
        productosMasVendidos,
        stockBajo,
        totalMovimientos,
        totalProductos,
        valorInventario,
        entradasPorDia,
        salidasPorDia
      };
    } catch (error) {
      console.error('Error procesando datos:', error);
      return datosVacios;
    }
  };

  const datos = procesarDatos();

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  if (dashboardLoading || productosMasVendidosLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <main className="p-4 mx-auto md:p-10 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Title>Panel de Control - Ferretería</Title>
          <Text>Análisis de inventario y movimientos</Text>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex gap-4">
            <select
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="PERIODO">Período Predefinido</option>
              <option value="RANGO">Rango de Fechas</option>
            </select>
          </div>
          
          {tipoFiltro === "PERIODO" ? (
            <select
              value={periodoVentas}
              onChange={(e) => setPeriodoVentas(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="HOY">Hoy</option>
              <option value="ULTIMOS_7_DIAS">Últimos 7 días</option>
              <option value="ULTIMOS_30_DIAS">Últimos 30 días</option>
              <option value="ESTE_MES">Este mes</option>
              <option value="ESTE_ANIO">Este año</option>
            </select>
          ) : (
            <div className="flex gap-2">
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="flex items-center">hasta</span>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}
        </form>
      </div>

      <TabGroup>
        <TabList>
          <Tab>General</Tab>
          <Tab>Movimientos</Tab>
          <Tab>Inventario</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-6 mt-6">
              <Card decoration="top" decorationColor="blue">
                <Title>Valor del Inventario</Title>
                <Text className="mt-4 text-2xl font-bold">
                  Bs. {datos.valorInventario.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </Card>
              <Card decoration="top" decorationColor="green">
                <Title>Total de Productos</Title>
                <Text className="mt-4 text-2xl font-bold">
                  {datos.totalProductos}
                </Text>
              </Card>
              <Card decoration="top" decorationColor="yellow">
                <Title>Movimientos en Periodo</Title>
                <Text className="mt-4 text-2xl font-bold">
                  {datos.totalMovimientos}
                </Text>
              </Card>
            </Grid>

            <Grid numItems={1} numItemsSm={2} className="gap-6 mt-6">
              <Card>
                <Title>Productos con Stock Bajo</Title>
                {datos.stockBajo.length > 0 ? (
                  <BarChart
                    className="mt-4 h-80"
                    data={datos.stockBajo}
                    index="nombre"
                    categories={["stock"]}
                    colors={["red"]}
                    yAxisWidth={48}
                  />
                ) : (
                  <Text className="mt-4 text-center text-gray-500">
                    No hay productos con stock bajo
                  </Text>
                )}
              </Card>

              <Card>
                <Title>Productos Más Vendidos</Title>
                {productosMasVendidosLoading ? (
                  <div className="flex items-center justify-center h-80">
                    <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
                  </div>
                ) : productosMasVendidosData?.productosMasVendidos?.length > 0 ? (
                  <div className="w-full h-80 min-h-[320px]">
                    <BarChart
                      className="h-full"
                      data={productosMasVendidosData.productosMasVendidos.map(item => ({
                        ...item,
                        nombre_producto: productosMap.get(item.producto_id) || `Producto #${item.producto_id}`
                      }))}
                      index="nombre_producto"
                      categories={["cantidad_total"]}
                      colors={["green"]}
                      yAxisWidth={48}
                      valueFormatter={(value) => Math.round(value).toString()}
                      minValue={0}
                      maxValue={Math.max(...productosMasVendidosData.productosMasVendidos.map(item => item.cantidad_total), 1) + 2}
                      yAxisTickFormatter={(value) => Math.round(value).toString()}
                    />
                  </div>
                ) : (
                  <Text className="mt-4 text-center text-gray-500">
                    No hay ventas registradas en el período seleccionado
                  </Text>
                )}
              </Card>
            </Grid>
          </TabPanel>

          <TabPanel>
            <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-6 mt-6">
              <Card>
                <Title>Productos Más Movidos</Title>
                {datos.productosPopulares.length > 0 ? (
                  <BarChart
                    className="mt-4 h-80"
                    data={datos.productosPopulares}
                    index="producto"
                    categories={["cantidad"]}
                    colors={["blue"]}
                    yAxisWidth={48}
                    valueFormatter={(value) => Math.round(value).toString()}
                  />
                ) : (
                  <Text className="mt-4 text-center text-gray-500">
                    No hay datos de movimientos en el período seleccionado
                  </Text>
                )}
              </Card>
            </Grid>
          </TabPanel>

          <TabPanel>
            <div className="mt-6">
              <Card>
                <Title>Tendencia de Entradas</Title>
                {datos.entradasPorDia.length > 0 ? (
                  <LineChart
                    className="mt-4 h-80"
                    data={datos.entradasPorDia}
                    index="fecha"
                    categories={["cantidad"]}
                    colors={["blue"]}
                    valueFormatter={(value) => Math.round(value).toString()}
                    yAxisWidth={60}
                    minValue={0}
                  />
                ) : (
                  <Text className="mt-4 text-center text-gray-500">
                    No hay movimientos de entrada registrados en el período seleccionado
                  </Text>
                )}
              </Card>
            </div>
            <div className="mt-6">
              <Card>
                <Title>Tendencia de Salidas</Title>
                {datos.salidasPorDia.length > 0 ? (
                  <LineChart
                    className="mt-4 h-80"
                    data={datos.salidasPorDia}
                    index="fecha"
                    categories={["cantidad"]}
                    colors={["red"]}
                    valueFormatter={(value) => Math.round(value).toString()}
                    yAxisWidth={60}
                    minValue={0}
                  />
                ) : (
                  <Text className="mt-4 text-center text-gray-500">
                    No hay movimientos de salida registrados en el período seleccionado
                  </Text>
                )}
              </Card>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </main>
  );
};