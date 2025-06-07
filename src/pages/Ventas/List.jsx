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
                accessorKey: "cliente",
                header: "Cliente",
                cell: ({ row }) =>
                    `${row.original.cliente?.nombre ?? ""} ${row.original.cliente?.apellido ?? ""}`,
            },
            {
                accessorKey: "total",
                header: "Total (Bs)",
                cell: ({ row }) => `Bs. ${row.original.total}`,
            },
            {
                accessorKey: "fecha",
                header: "Fecha",
                cell: ({ row }) =>
                    new Date(row.original.fecha).toLocaleDateString(),
            },
        ],
        []
    );

    const table = useReactTable({
        data: ventas,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    if (loading) return <p>Cargando ventas...</p>;
    if (error) return <p className="text-red-600">Error: {error.message}</p>;

    return (
        <div className="p-6 bg-white rounded shadow">
            <div className="flex flex-col justify-between gap-4 mb-4 sm:flex-row">
                <h2 className="text-xl font-semibold">Ventas</h2>
                <Link
                    to="/ventas/nueva"
                    className="px-4 py-2 text-center text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                    Nueva Venta
                </Link>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th key={header.id} className="px-4 py-2 font-medium text-left text-gray-700 whitespace-nowrap">
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                </th>
                            ))}
                        </tr>
                    ))}
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {table.getRowModel().rows.map(row => (
                        <tr key={row.id}>
                            {row.getVisibleCells().map(cell => (
                                <td key={cell.id} className="px-4 py-2 whitespace-nowrap">
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default VentasList;
