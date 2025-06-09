import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative overflow-hidden">
        <div className="absolute inset-y-0 w-full h-full" aria-hidden="true">
          <div className="relative h-full">
            <svg
              className="absolute transform right-full translate-y-1/3 translate-x-1/4 md:translate-y-1/2 sm:translate-x-1/2 lg:translate-x-full"
              width="404"
              height="784"
              fill="none"
              viewBox="0 0 404 784"
            >
              <defs>
                <pattern
                  id="e229dbec-10e9-49ee-8ec3-0286ca089edf"
                  x="0"
                  y="0"
                  width="20"
                  height="20"
                  patternUnits="userSpaceOnUse"
                >
                  <rect x="0" y="0" width="4" height="4" className="text-gray-200" fill="currentColor" />
                </pattern>
              </defs>
              <rect width="404" height="784" fill="url(#e229dbec-10e9-49ee-8ec3-0286ca089edf)" />
            </svg>
            <svg
              className="absolute transform left-full -translate-y-3/4 -translate-x-1/4 sm:-translate-x-1/2 md:-translate-y-1/2 lg:-translate-x-3/4"
              width="404"
              height="784"
              fill="none"
              viewBox="0 0 404 784"
            >
              <defs>
                <pattern
                  id="d2a68204-c383-44b1-b99f-42ccff4e5365"
                  x="0"
                  y="0"
                  width="20"
                  height="20"
                  patternUnits="userSpaceOnUse"
                >
                  <rect x="0" y="0" width="4" height="4" className="text-gray-200" fill="currentColor" />
                </pattern>
              </defs>
              <rect width="404" height="784" fill="url(#d2a68204-c383-44b1-b99f-42ccff4e5365)" />
            </svg>
          </div>
        </div>

        <div className="relative pt-6 pb-16 sm:pb-24">
          <div className="px-4 mx-auto max-w-7xl sm:px-6">
            <nav className="relative flex items-center justify-between sm:h-10 md:justify-center">
              <div className="flex items-center flex-1 md:absolute md:inset-y-0 md:left-0">
                <div className="flex items-center justify-between w-full md:w-auto">
                  <Link to="/">
                    <span className="sr-only">Ferretería</span>
                    <img
                      className="w-auto h-8 sm:h-10"
                      src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg"
                      alt=""
                    />
                  </Link>
                </div>
              </div>
            </nav>
          </div>

          <div className="px-4 mx-auto mt-16 max-w-7xl sm:mt-24 sm:px-6">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Sistema de Gestión para</span>
                <span className="block text-indigo-600">Ferreterías</span>
              </h1>
              <p className="max-w-md mx-auto mt-3 text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                Gestiona tu inventario, ventas y personal de manera eficiente con nuestro sistema integral.
              </p>
              <div className="max-w-md mx-auto mt-5 sm:flex sm:justify-center md:mt-8">
                {isAuthenticated ? (
                  <div className="rounded-md shadow">
                    <Link
                      to="/app/dashboard"
                      className="flex items-center justify-center w-full px-8 py-3 text-base font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                    >
                      Ir al Dashboard
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="rounded-md shadow">
                      <Link
                        to="/register"
                        className="flex items-center justify-center w-full px-8 py-3 text-base font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                      >
                        Registrarse
                      </Link>
                    </div>
                    <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                      <Link
                        to="/login"
                        className="flex items-center justify-center w-full px-8 py-3 text-base font-medium text-indigo-600 bg-white border border-transparent rounded-md hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                      >
                        Iniciar Sesión
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base font-semibold tracking-wide text-blue-600 uppercase">Características</h2>
            <p className="mt-2 text-3xl font-extrabold leading-8 tracking-tight text-gray-900 sm:text-4xl">
              Todo lo que necesitas para tu ferretería
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              {/* Feature 1 */}
              <div className="relative">
                <div className="text-lg font-medium leading-6 text-gray-900">Gestión de Inventario</div>
                <p className="mt-2 text-base text-gray-500">
                  Control total de productos, categorías y proveedores. Alertas automáticas de stock bajo, reportes detallados y control de stock por almacén.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="relative">
                <div className="text-lg font-medium leading-6 text-gray-900">Sistema de Ventas y Facturación</div>
                <p className="mt-2 text-base text-gray-500">
                  Proceso de ventas ágil, múltiples formas de pago, generación automática de facturas y control de historial de ventas.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="relative">
                <div className="text-lg font-medium leading-6 text-gray-900">Gestión de Compras y Proveedores</div>
                <p className="mt-2 text-base text-gray-500">
                  Registro de compras, actualización automática de stock, historial de compras y administración de proveedores.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="relative">
                <div className="text-lg font-medium leading-6 text-gray-900">Movimientos de Inventario</div>
                <p className="mt-2 text-base text-gray-500">
                  Registro y seguimiento de entradas y salidas de productos, con trazabilidad por usuario y almacén.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="relative">
                <div className="text-lg font-medium leading-6 text-gray-900">Dashboard y Reportes</div>
                <p className="mt-2 text-base text-gray-500">
                  Panel de control con indicadores clave (KPIs), gráficos de ventas, inventario y movimientos. Exportación de reportes.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="relative">
                <div className="text-lg font-medium leading-6 text-gray-900">Gestión de Usuarios y Seguridad</div>
                <p className="mt-2 text-base text-gray-500">
                  Control de acceso por roles, gestión de usuarios y registro de actividad para mayor seguridad y control.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50">
        <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-base text-gray-400">
              © 2025 Ferretería. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 