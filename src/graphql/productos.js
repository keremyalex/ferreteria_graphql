import { gql } from "@apollo/client";

export const GET_PRODUCTOS = gql`
    query {
        productos {
            id
            nombre
            descripcion
            precio
            urlImagen
            categoria {
                id
                nombre
            }
            unidadMedida {
                id
                nombre
                abreviatura
            }
            stocks {
                id
                cantidad
                estado
                almacen {
                    id
                    nombre
                }
            }
        }
    }
`;

export const GET_PRODUCTO = gql`
    query GetProducto($id: ID!) {
        producto(id: $id) {
            id
            nombre
            descripcion
            precio
            urlImagen
            categoria {
                id
                nombre
            }
            unidadMedida {
                id
                nombre
                abreviatura
            }
            stocks {
                id
                cantidad
                estado
                almacen {
                    id
                    nombre
                }
            }
        }
    }
`;

export const GET_CATEGORIAS = gql`
    query {
        categorias {
            id
            nombre
            descripcion
        }
    }
`;

export const GET_UNIDADES_MEDIDA = gql`
    query {
        unidadesMedida {
            id
            nombre
            abreviatura
        }
    }
`;

export const GET_ALMACENES = gql`
    query {
        almacenes {
            id
            nombre
            ubicacion
        }
    }
`;

export const CREATE_PRODUCTO = gql`
    mutation CrearProducto($input: ProductoInput!) {
        crearProducto(input: $input) {
            id
            nombre
            descripcion
            precio
            urlImagen
            categoria {
                id
                nombre
            }
            unidadMedida {
                id
                nombre
            }
            stocks {
                id
                cantidad
                estado
                almacen {
                    id
                    nombre
                }
            }
        }
    }
`;

export const UPDATE_PRODUCTO = gql`
    mutation ActualizarProducto($id: ID!, $input: ProductoInput!) {
        actualizarProducto(id: $id, input: $input) {
            id
            nombre
            descripcion
            precio
            urlImagen
            categoria {
                id
                nombre
            }
            unidadMedida {
                id
                nombre
            }
            stocks {
                id
                cantidad
                estado
                almacen {
                    id
                    nombre
                }
            }
        }
    }
`;

export const UPDATE_PRODUCTO_PRECIO = gql`
    mutation ActualizarPrecioProducto($id: ID!, $precio: Float!) {
        actualizarPrecioProducto(id: $id, precio: $precio) {
            id
            precio
        }
    }
`;

export const DELETE_PRODUCTO = gql`
    mutation EliminarProducto($id: ID!) {
        eliminarProducto(id: $id)
    }
`; 
