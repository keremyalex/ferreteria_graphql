import { useState } from "react";
import { useMutation } from "@apollo/client";
import { CREATE_CLIENTE } from "../../graphql/clientes";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ClientesCreate = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ nombre: "", apellido: "", email: "" });

    const [crearCliente, { loading }] = useMutation(CREATE_CLIENTE, {
        onCompleted: () => {
            toast.success("Cliente registrado con éxito");
            navigate("/clientes");
        },
        onError: (error) => {
            toast.error("Error al registrar cliente: " + error.message);
        },
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        crearCliente({ variables: form });
    };

    return (
        <div className="bg-white max-w-md p-6 rounded shadow mx-auto mt-4">
            <h2 className="text-xl font-semibold mb-4">Registrar Cliente</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    name="nombre"
                    type="text"
                    placeholder="Nombre"
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    value={form.nombre}
                    onChange={handleChange}
                    required
                />
                <input
                    name="apellido"
                    type="text"
                    placeholder="Apellido"
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    value={form.apellido}
                    onChange={handleChange}
                    required
                />
                <input
                    name="email"
                    type="email"
                    placeholder="Correo"
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    value={form.email}
                    onChange={handleChange}
                    required
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
                >
                    {loading ? "Guardando..." : "Guardar"}
                </button>
            </form>
        </div>
    );
};

export default ClientesCreate;
