import { useQuery } from "@apollo/client";
import { GET_VENTAS } from "../../graphql/ventas";
import { Link } from "react-router-dom";
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
} from "@tanstack/react-table";
import { useMemo } from "react";

const VentasList = () => {
    const { data, loading, error } = useQuery(GET_VENTAS);
    const ventas = data?.ventas || [];

    const columns = useMemo(
        () => [
            {
                accessorKey: "id",
                header: "ID",
            },
            {
                accessorKey: "cliente",
                header: "Cliente",
                cell: ({ row }) =>
                    `${row.original.cliente.nombre} ${row.original.cliente.apellido}`,
            },
            {
                accessorKey: "total",
                header: "Total",
                cell: ({ row }) => `Bs. ${row.original.total.toFixed(2)}`,
            },
            {
                accessorKey: "estado",
                header: "Estado",
                cell: ({ row }) => (
                    <span
                        className={`px-2 py-1 text-sm rounded ${
                            row.original.estado === "PENDIENTE"
                                ? "bg-yellow-100 text-yellow-800"
                                : row.original.estado === "COMPLETADA"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                        }`}
                    >
                        {row.original.estado}
                    </span>
                ),
            },
            {
                accessorKey: "metodo_pago",
                header: "Método de Pago",
                cell: ({ row }) => (
                    <span className="px-2 py-1 text-sm text-blue-800 bg-blue-100 rounded">
                        {row.original.metodo_pago}
                    </span>
                ),
            },
            {
                accessorKey: "fecha",
                header: "Fecha",
                cell: ({ row }) =>
                    new Date(row.original.fecha).toLocaleString(),
            },
            {
                id: "acciones",
                header: "Acciones",
                cell: ({ row }) => (
                    <div className="flex gap-2">
                        <Link
                            to={`/app/ventas/${row.original.id}`}
                            className="px-2 py-1 text-xs text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                        >
                            Ver Detalles
                        </Link>
                        {row.original.estado === "COMPLETADA" && (
                            <Link
                                to={`/app/ventas/${row.original.id}/factura`}
                                className="px-2 py-1 text-xs text-green-600 border border-green-600 rounded hover:bg-green-50"
                            >
                                Factura
                            </Link>
                        )}
                    </div>
                ),
            },
        ],
        []
    );

    const table = useReactTable({
        data: ventas,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
    );
    
    if (error) return (
        <div className="p-4 m-4 text-red-700 bg-red-100 border border-red-700 rounded">
            <p>Error: {error.message}</p>
        </div>
    );

    return (
        <div className="p-6 bg-white rounded shadow">
            <div className="flex flex-col justify-between gap-4 mb-6 sm:flex-row">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Ventas</h2>
                    <p className="text-gray-600">Gestiona tus ventas y facturas</p>
                </div>
                <Link
                    to="/app/ventas/nueva"
                    className="inline-flex items-center px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Nueva Venta
                </Link>
            </div>
            
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full text-sm divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th key={header.id} className="px-4 py-3 font-medium text-left text-gray-700">
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {table.getRowModel().rows.map(row => (
                            <tr key={row.id} className="hover:bg-gray-50">
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id} className="px-4 py-3">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                {ventas.length === 0 && (
                    <div className="p-4 text-center text-gray-500">
                        No hay ventas registradas
                    </div>
                )}
            </div>
        </div>
    );
};

export default VentasList;
