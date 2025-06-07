import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
    ChevronUpIcon
} from "@heroicons/react/24/outline";

const navigation = [
    { id: 1, name: 'Dashboard', href: '/app/dashboard', icon: HomeIcon },
    { id: 2, name: 'Clientes', href: '/app/clientes', icon: UsersIcon },
    { id: 3, name: 'Productos', href: '/app/productos', icon: CubeIcon },
    { id: 4, name: 'Almacenes', href: '/app/almacenes', icon: BuildingStorefrontIcon },
    { id: 5, name: 'Categorías', href: '/app/categorias', icon: TagIcon },
    { id: 6, name: 'Unidades de Medida', href: '/app/unidades-medida', icon: ScaleIcon },
    { id: 7, name: 'Inventario', href: '/app/movimientos/todos', icon: ArrowsRightLeftIcon },
    { id: 8, name: 'Ventas', href: '/app/ventas', icon: ShoppingCartIcon },
    { id: 9, name: 'Proveedores', href: '/app/proveedores', icon: TruckIcon },
    { id: 10, name: 'Compras', href: '/app/compras', icon: ShoppingBagIcon }
];

export default function Sidebar() {
    const location = useLocation();
    const [openMenus, setOpenMenus] = useState({});

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
                {navigation.map((item) => (
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
