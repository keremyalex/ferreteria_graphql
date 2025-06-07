import { gql } from "@apollo/client";

export const GET_CLIENTES = gql`
    query {
        clientes {
            id
            nombre
            apellido
            email
            ci
            telefono
            direccion
            tipo_cliente
            fecha_registro
        }
    }
`;

export const GET_CLIENTE = gql`
    query GetCliente($id: Int!) {
        cliente(id: $id) {
            id
            nombre
            apellido
            email
            ci
            telefono
            direccion
            tipo_cliente
            fecha_registro
        }
    }
`;

export const CREATE_CLIENTE = gql`
    mutation CrearCliente($createClienteInput: CreateClienteInput!) {
        crearCliente(createClienteInput: $createClienteInput) {
            id
            nombre
            apellido
            email
            ci
            telefono
            direccion
            tipo_cliente
            fecha_registro
        }
    }
`;

export const UPDATE_CLIENTE = gql`
    mutation ActualizarCliente($updateClienteInput: UpdateClienteInput!) {
        actualizarCliente(updateClienteInput: $updateClienteInput) {
            id
            nombre
            apellido
            email
            ci
            telefono
            direccion
            tipo_cliente
            fecha_registro
        }
    }
`;

export const DELETE_CLIENTE = gql`
    mutation EliminarCliente($id: Float!) {
        eliminarCliente(id: $id)
    }
`;
