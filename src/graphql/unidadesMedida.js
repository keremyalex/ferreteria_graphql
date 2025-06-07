import { gql } from '@apollo/client';

export const GET_UNIDADES_MEDIDA = gql`
  query GetUnidadesMedida {
    unidadesMedida {
      id
      nombre
      abreviatura
      productos {
        id
        nombre
      }
    }
  }
`;

export const GET_UNIDAD_MEDIDA = gql`
  query GetUnidadMedida($id: ID!) {
    unidadMedida(id: $id) {
      id
      nombre
      abreviatura
      productos {
        id
        nombre
      }
    }
  }
`;

export const CREATE_UNIDAD_MEDIDA = gql`
  mutation CrearUnidadMedida($nombre: String!, $abreviatura: String!) {
    crearUnidadMedida(nombre: $nombre, abreviatura: $abreviatura) {
      id
      nombre
      abreviatura
    }
  }
`;

export const UPDATE_UNIDAD_MEDIDA = gql`
  mutation ActualizarUnidadMedida($id: ID!, $nombre: String!, $abreviatura: String!) {
    actualizarUnidadMedida(id: $id, nombre: $nombre, abreviatura: $abreviatura) {
      id
      nombre
      abreviatura
    }
  }
`;

export const DELETE_UNIDAD_MEDIDA = gql`
  mutation EliminarUnidadMedida($id: ID!) {
    eliminarUnidadMedida(id: $id)
  }
`; 