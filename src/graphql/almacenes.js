import { gql } from "@apollo/client";

export const GET_ALMACENES = gql`
    query GetAlmacenes {
        almacenes {
            id
            nombre
            ubicacion
            stocks {
                id
                cantidad
                producto {
                    id
                    nombre
                }
                estado
            }
        }
    }
`;

export const GET_ALMACEN = gql`
    query GetAlmacen($id: ID!) {
        almacen(id: $id) {
            id
            nombre
            ubicacion
            stocks {
                id
                cantidad
                producto {
                    id
                    nombre
                }
                estado
            }
        }
    }
`;

export const CREATE_ALMACEN = gql`
    mutation CrearAlmacen($nombre: String!, $ubicacion: String!) {
        crearAlmacen(nombre: $nombre, ubicacion: $ubicacion) {
            id
            nombre
            ubicacion
        }
    }
`;

export const UPDATE_ALMACEN = gql`
    mutation ActualizarAlmacen($id: ID!, $nombre: String!, $ubicacion: String!) {
        actualizarAlmacen(id: $id, nombre: $nombre, ubicacion: $ubicacion) {
            id
            nombre
            ubicacion
        }
    }
`;

export const DELETE_ALMACEN = gql`
    mutation EliminarAlmacen($id: ID!) {
        eliminarAlmacen(id: $id)
    }
`; 