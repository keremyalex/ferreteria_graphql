import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import {
    HomeIcon,
    UsersIcon,
    CubeIcon,
    BuildingStorefrontIcon,
    TagIcon,
    ScaleIcon,
    ArrowsRightLeftIcon,
    ShoppingCartIcon,
    TruckIcon,
    ShoppingBagIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    UserGroupIcon
} from "@heroicons/react/24/outline";

const getNavigation = (hasPermission) => [
    { 
        id: 1, 
        name: 'Dashboard', 
        href: '/app/dashboard', 
        icon: HomeIcon,
        show: true // Dashboard siempre visible
    },
    { 
        id: 2, 
        name: 'Usuarios', 
        href: '/app/usuarios', 
        icon: UserGroupIcon,
        show: hasPermission('USUARIOS', 'VIEW')
    },
    { 
        id: 3, 
        name: 'Clientes', 
        href: '/app/clientes', 
        icon: UsersIcon,
        show: hasPermission('CLIENTES', 'VIEW')
    },
    { 
        id: 4, 
        name: 'Productos', 
        href: '/app/productos', 
        icon: CubeIcon,
        show: hasPermission('PRODUCTOS', 'VIEW')
    },
    { 
        id: 5, 
        name: 'Almacenes', 
        href: '/app/almacenes', 
        icon: BuildingStorefrontIcon,
        show: hasPermission('ALMACENES', 'VIEW')
    },
    { 
        id: 6, 
        name: 'Categorías', 
        href: '/app/categorias', 
        icon: TagIcon,
        show: hasPermission('CATEGORIAS', 'VIEW')
    },
    { 
        id: 7, 
        name: 'Unidades de Medida', 
        href: '/app/unidades-medida', 
        icon: ScaleIcon,
        show: hasPermission('UNIDADES_MEDIDA', 'VIEW')
    },
    { 
        id: 8, 
        name: 'Inventario', 
        href: '/app/movimientos/todos', 
        icon: ArrowsRightLeftIcon,
        show: hasPermission('INVENTARIO', 'VIEW')
    },
    { 
        id: 9, 
        name: 'Ventas', 
        href: '/app/ventas', 
        icon: ShoppingCartIcon,
        show: hasPermission('VENTAS', 'VIEW')
    },
    { 
        id: 10, 
        name: 'Proveedores', 
        href: '/app/proveedores', 
        icon: TruckIcon,
        show: hasPermission('PROVEEDORES', 'VIEW')
    },
    { 
        id: 11, 
        name: 'Compras', 
        href: '/app/compras', 
        icon: ShoppingBagIcon,
        show: hasPermission('COMPRAS', 'VIEW')
    }
];

export default function Sidebar() {
    const location = useLocation();
    const { hasPermission } = useAuth();
    const [openMenus, setOpenMenus] = useState({});

    const navigation = getNavigation(hasPermission);

    const isActive = (path) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    const toggleMenu = (menuName) => {
        setOpenMenus(prev => ({
            ...prev,
            [menuName]: !prev[menuName]
        }));
    };

    return (
        <div className="flex flex-col h-full bg-white border-r border-gray-200">
            <div className="flex items-center justify-center h-16 px-4">
                <h1 className="text-xl font-semibold text-gray-800">Ferretería</h1>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navigation.filter(item => item.show).map((item) => (
                    <div key={item.id} className="space-y-1">
                        {item.children ? (
                            <>
                                <button
                                    onClick={() => toggleMenu(item.name.toLowerCase())}
                                    className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                                        item.children.some(child => isActive(child.href))
                                            ? "text-blue-600 bg-blue-50"
                                            : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                                    }`}
                                >
                                    <item.icon className="w-5 h-5 mr-2" />
                                    {item.name}
                                    {openMenus[item.name.toLowerCase()] ? (
                                        <ChevronUpIcon className="w-4 h-4 ml-auto" />
                                    ) : (
                                        <ChevronDownIcon className="w-4 h-4 ml-auto" />
                                    )}
                                </button>
                                {openMenus[item.name.toLowerCase()] && (
                                    <div className="ml-4 space-y-1">
                                        {item.children.map((child) => (
                                            <Link
                                                key={child.id}
                                                to={child.href}
                                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                                                    isActive(child.href)
                                                        ? "text-blue-600 bg-blue-50"
                                                        : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                                                }`}
                                            >
                                                {child.icon && <child.icon className="w-4 h-4 mr-2" />}
                                                {child.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <Link
                                to={item.href}
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                                    isActive(item.href)
                                        ? "text-blue-600 bg-blue-50"
                                        : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                                }`}
                            >
                                <item.icon className="w-5 h-5 mr-2" />
                                {item.name}
                            </Link>
                        )}
                    </div>
                ))}
            </nav>
        </div>
    );
}
