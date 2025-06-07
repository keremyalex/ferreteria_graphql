import { gql } from "@apollo/client";

export const GET_VENTAS = gql`
    query {
        ventas {
            id
            cliente {
                nombre
                apellido
            }
            total
            fecha
        }
    }
`;
