import { Card, Title, Text, Tab, TabList, TabGroup, TabPanels, TabPanel, Grid, DateRangePicker, Select, SelectItem } from "@tremor/react";
import { BarChart, LineChart, DonutChart } from "@tremor/react";
import { useState, useMemo } from "react";
import { useQuery } from "@apollo/client";
import { GET_DASHBOARD_DATA } from "../graphql/Dashboard";

// Funciones de utilidad para manejo de fechas
const formatearFecha = (fecha) => {
  // Convertir cualquier formato de fecha a objeto Date
  const date = new Date(fecha);
  return date.toISOString().split('T')[0]; // Retorna YYYY-MM-DD
};

const compararFechas = (fecha, desde, hasta) => {
  // Convertir todas las fechas a timestamps para comparación
  const fechaTimestamp = new Date(fecha).getTime();
  const desdeTimestamp = new Date(desde.setHours(0, 0, 0, 0)).getTime(); // Inicio del día
  const hastaTimestamp = new Date(hasta.setHours(23, 59, 59, 999)).getTime(); // Fin del día

  return fechaTimestamp >= desdeTimestamp && fechaTimestamp <= hastaTimestamp;
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
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });

  const { data: dashboardData, loading: dashboardLoading } = useQuery(GET_DASHBOARD_DATA);

  // Procesamiento de datos para los gráficos
  const procesarDatos = () => {
    const datosVacios = {
      movimientosPorDia: [],
      productosPopulares: [],
      productosMasVendidos: [],
      stockBajo: [],
      totalMovimientos: 0,
      totalProductos: 0,
      valorInventario: 0
    };

    if (!dashboardData || !dashboardData.productos || !dashboardData.todosLosMovimientos) {
      return datosVacios;
    }

    try {
      // Filtrar movimientos por rango de fechas
      const movimientosFiltrados = dashboardData.todosLosMovimientos
        .filter(mov => mov && mov.fecha && mov.producto)
        .filter(mov => compararFechas(mov.fecha, dateRange.from, dateRange.to) && mov.estado === 'ACTIVO');

      // Datos para gráfico de movimientos por día
      const movimientosPorDia = agruparPorFecha(movimientosFiltrados);

      // Productos más movidos (todos los movimientos)
      const productosPopulares = movimientosFiltrados
        .reduce((acc, mov) => {
          const existente = acc.find(p => p.producto === mov.producto.nombre);
          if (existente) {
            existente.cantidad += Number(mov.cantidad) || 0;
          } else {
            acc.push({
              producto: mov.producto.nombre,
              cantidad: Number(mov.cantidad) || 0
            });
          }
          return acc;
        }, [])
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 5);

      // Productos más vendidos (solo salidas)
      const movimientosSalida = movimientosFiltrados
        .filter(mov => mov.tipoMovimiento === 'SALIDA');
      
      const productosMasVendidos = movimientosSalida
        .reduce((acc, mov) => {
          const existente = acc.find(p => p.producto === mov.producto.nombre);
          if (existente) {
            existente.cantidad += Number(mov.cantidad) || 0;
          } else {
            acc.push({
              producto: mov.producto.nombre,
              cantidad: Number(mov.cantidad) || 0
            });
          }
          return acc;
        }, [])
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
            stock: stockTotal
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
          return total + (stockTotal * Number(producto.precio));
        }, 0);

      return {
        movimientosPorDia,
        productosPopulares,
        productosMasVendidos,
        stockBajo,
        totalMovimientos,
        totalProductos,
        valorInventario
      };
    } catch (error) {
      console.error('Error procesando datos:', error);
      return datosVacios;
    }
  };

  const datos = procesarDatos();

  if (dashboardLoading) return (
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
        <DateRangePicker
          value={dateRange}
          onValueChange={setDateRange}
          locale="es-ES"
          className="max-w-md"
          selectPlaceholder="Seleccionar fechas"
        />
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
                  ${datos.valorInventario.toFixed(2)}
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

            <div className="mt-6">
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
                  />
                ) : (
                  <Text className="mt-4 text-center text-gray-500">
                    No hay datos de movimientos en el período seleccionado
                  </Text>
                )}
              </Card>
            </div>
          </TabPanel>

          <TabPanel>
            <div className="mt-6">
              <Card>
                <Title>Tendencia de Movimientos</Title>
                {datos.movimientosPorDia.length > 0 ? (
                  <LineChart
                    className="mt-4 h-80"
                    data={datos.movimientosPorDia}
                    index="fecha"
                    categories={["cantidad"]}
                    colors={["blue"]}
                    valueFormatter={(value) => value.toFixed(0)}
                    yAxisWidth={60}
                  />
                ) : (
                  <Text className="mt-4 text-center text-gray-500">
                    No hay movimientos registrados en el período seleccionado
                  </Text>
                )}
              </Card>
            </div>
          </TabPanel>

          <TabPanel>
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
                {datos.productosMasVendidos.length > 0 ? (
                  <BarChart
                    className="mt-4 h-80"
                    data={datos.productosMasVendidos}
                    index="producto"
                    categories={["cantidad"]}
                    colors={["green"]}
                    yAxisWidth={48}
                  />
                ) : (
                  <Text className="mt-4 text-center text-gray-500">
                    No hay ventas registradas en el período seleccionado
                  </Text>
                )}
              </Card>
            </Grid>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </main>
  );
};