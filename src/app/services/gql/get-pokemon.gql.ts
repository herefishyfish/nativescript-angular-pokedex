import { gql } from "apollo-angular";

export interface Pokemon {
  id: number;
  name: string;
};

export interface PokemonResponse {
  pokemon_v2_pokemon: Pokemon[];
};
 
export const GET_POKEMON = gql<PokemonResponse, { limit: number, offset: number }>`
  query GetPokemon($limit: Int, $offset: Int) {
    pokemon_v2_pokemon(limit: $limit, offset: $offset) {
      id
      name
    }
  }
`;