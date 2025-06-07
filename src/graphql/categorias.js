import { gql } from "@apollo/client";

export const GET_CATEGORIAS = gql`
    query {
        categorias {
            id
            nombre
            descripcion
            productos {
                id
                nombre
            }
        }
    }
`;

export const GET_CATEGORIA = gql`
    query GetCategoria($id: ID!) {
        categoria(id: $id) {
            id
            nombre
            descripcion
            productos {
                id
                nombre
            }
        }
    }
`;

export const CREATE_CATEGORIA = gql`
    mutation CrearCategoria($nombre: String!, $descripcion: String) {
        crearCategoria(nombre: $nombre, descripcion: $descripcion) {
            id
            nombre
            descripcion
        }
    }
`;

export const UPDATE_CATEGORIA = gql`
    mutation ActualizarCategoria($id: ID!, $nombre: String!, $descripcion: String) {
        actualizarCategoria(id: $id, nombre: $nombre, descripcion: $descripcion) {
            id
            nombre
            descripcion
        }
    }
`;

export const DELETE_CATEGORIA = gql`
    mutation EliminarCategoria($id: ID!) {
        eliminarCategoria(id: $id)
    }
`; 