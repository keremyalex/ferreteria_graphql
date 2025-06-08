import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ApolloProvider } from "@apollo/client";
import { client } from "./apollo/client";
import { Login } from './components/Login';
import { LandingPage } from './components/LandingPage';
import { ProtectedLayout } from './components/ProtectedLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ToastContainer } from "react-toastify";
import { Register } from './components/Register';
import { Dashboard } from './components/Dashboard';
import { AuthProvider, useAuth, ROLES } from './context/AuthContext';
import { UsuariosList } from './pages/Usuarios/List';
import { UsuarioForm } from './pages/Usuarios/Form';
import ClientesList from './pages/Clientes/List';
import { ClienteForm } from './pages/Clientes/Form';
import { ProductosList } from './pages/Productos/List';
import { ProductoForm } from './pages/Productos/Form';
import { AlmacenForm } from './pages/Almacenes/Form';
import { AlmacenesList } from './pages/Almacenes/List';
import { CategoriaForm } from './pages/Categorias/Form';
import { CategoriasList } from './pages/Categorias/List';
import UnidadesMedidaList from './pages/UnidadesMedida/List';
import { UnidadMedidaForm } from './pages/UnidadesMedida/Form';
import { MovimientosList } from './pages/Movimientos/List';
import { MovimientoForm } from './pages/Movimientos/Form';
import { TodosMovimientosList } from './pages/Movimientos/TodosMovimientos';
import { ProveedoresList } from './pages/Proveedores/List';
import { ProveedorForm } from './pages/Proveedores/Form';
import { ComprasList } from './pages/Compras/List';
import { CompraForm } from './pages/Compras/Form';
import { CompraView } from './pages/Compras/View';
import VentasList from './pages/Ventas/List';
import NuevaVenta from './pages/Ventas/Nueva';
import DetalleVenta from './pages/Ventas/Detalle';
import Factura from './pages/Ventas/Factura';
import VerFactura from './pages/Facturas/Ver';

// Componente para manejar la redirección de la ruta raíz
function RootRoute() {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return isAuthenticated ? <Navigate to="/app/dashboard" replace /> : <LandingPage />;
}

function App() {
    return (
        <AuthProvider>
            <ApolloProvider client={client}>
                <Router>
                    <ToastContainer position="top-right" autoClose={3000} />
                    <Routes>
                        <Route path="/" element={<RootRoute />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/app/*" element={<ProtectedLayout />}>
                            <Route index element={<Navigate to="/app/dashboard" replace />} />
                            <Route path="dashboard" element={<Dashboard />} />
                            <Route path="usuarios">
                                <Route index element={
                                    <ProtectedRoute 
                                        requiredPermission="USUARIOS"
                                        requiredAction="VIEW"
                                    >
                                        <UsuariosList />
                                    </ProtectedRoute>
                                } />
                                <Route path="crear" element={
                                    <ProtectedRoute 
                                        requiredPermission="USUARIOS"
                                        requiredAction="CREATE"
                                    >
                                        <UsuarioForm />
                                    </ProtectedRoute>
                                } />
                                <Route path="editar/:id" element={
                                    <ProtectedRoute 
                                        requiredPermission="USUARIOS"
                                        requiredAction="EDIT"
                                    >
                                        <UsuarioForm />
                                    </ProtectedRoute>
                                } />
                            </Route>
                            <Route path="clientes">
                                <Route index element={<ClientesList />} />
                                <Route path="crear" element={<ClienteForm />} />
                                <Route path="editar/:id" element={<ClienteForm />} />
                            </Route>
                            <Route path="productos">
                                <Route index element={
                                    <ProtectedRoute 
                                        requiredPermission="PRODUCTOS"
                                        requiredAction="VIEW"
                                    >
                                        <ProductosList />
                                    </ProtectedRoute>
                                } />
                                <Route path="crear" element={
                                    <ProtectedRoute 
                                        requiredPermission="PRODUCTOS"
                                        requiredAction="CREATE"
                                    >
                                        <ProductoForm />
                                    </ProtectedRoute>
                                } />
                                <Route path="editar/:id" element={
                                    <ProtectedRoute 
                                        requiredPermission="PRODUCTOS"
                                        requiredAction="EDIT"
                                    >
                                        <ProductoForm />
                                    </ProtectedRoute>
                                } />
                            </Route>
                            <Route path="almacenes">
                                <Route index element={<AlmacenesList />} />
                                <Route path="crear" element={<AlmacenForm />} />
                                <Route path="editar/:id" element={<AlmacenForm />} />
                            </Route>
                            <Route path="categorias">
                                <Route index element={<CategoriasList />} />
                                <Route path="crear" element={<CategoriaForm />} />
                                <Route path="editar/:id" element={<CategoriaForm />} />
                            </Route>
                            <Route path="unidades-medida">
                                <Route index element={<UnidadesMedidaList />} />
                                <Route path="crear" element={<UnidadMedidaForm />} />
                                <Route path="editar/:id" element={<UnidadMedidaForm />} />
                            </Route>
                            <Route path="movimientos">
                                <Route index element={<MovimientosList />} />
                                <Route path="crear" element={<MovimientoForm />} />
                                <Route path="editar/:id" element={<MovimientoForm />} />
                                <Route path="todos" element={<TodosMovimientosList />} />
                            </Route>
                            <Route path="proveedores">
                                <Route index element={<ProveedoresList />} />
                                <Route path="crear" element={<ProveedorForm />} />
                                <Route path="editar/:id" element={<ProveedorForm />} />
                            </Route>
                            <Route path="compras">
                                <Route index element={<ComprasList />} />
                                <Route path="crear" element={<CompraForm />} />
                                <Route path="editar/:id" element={<CompraForm />} />
                                <Route path="ver/:id" element={<CompraView />} />
                            </Route>
                            <Route path="ventas">
                                <Route index element={<VentasList />} />
                                <Route path="nueva" element={<NuevaVenta />} />
                                <Route path=":id" element={<DetalleVenta />} />
                                <Route path=":id/factura" element={<Factura />} />
                            </Route>
                            <Route path="facturas/:id" element={<VerFactura />} />
                        </Route>
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Router>
            </ApolloProvider>
        </AuthProvider>
    );
}

export default App;
