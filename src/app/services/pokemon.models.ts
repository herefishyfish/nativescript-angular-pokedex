import {PokemonDetailsResponse} from './gql/get-pokemon-details.gql';

export interface Pokemon {
  image: string;
  sprite: string;
  id: number;
  name: string;
}

export interface PokemonDetails extends PokemonDetailsResponse {
  abilities: any;
  moves: any;
  species: any;
  stats: any;
  height: number;
  weight: number;
}