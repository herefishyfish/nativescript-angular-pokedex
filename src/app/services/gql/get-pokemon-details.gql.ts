import { gql } from "apollo-angular";

interface PokemonDetailsResponse {
  pokemon_v2_pokemon: Pokemonv2pokemon[];
}

interface Pokemonv2pokemon {
  height: number;
  weight: number;
  name: string;
  id: number;
  order: number;
  pokemon_v2_pokemonstats: Pokemonv2pokemonstat[];
  pokemon_v2_pokemonmoves: Pokemonv2pokemonmove[];
  pokemon_v2_pokemontypes: Pokemonv2pokemontype[];
  pokemon_v2_pokemonabilities: Pokemonv2pokemonability[];
  pokemon_v2_pokemonspecy: Pokemonv2pokemonspecy;
}

interface Pokemonv2pokemonstat {
  base_stat: number;
  pokemon_v2_stat: Pokemonv2stat;
}

interface Pokemonv2stat {
  name: string;
}

interface Pokemonv2pokemonspecy {
  base_happiness: number;
  capture_rate: number;
  gender_rate: number;
  pokemon_v2_pokemoncolor: Pokemonv2type;
  pokemon_v2_pokemonshape: Pokemonv2type;
  pokemon_v2_pokemonhabitat: Pokemonv2type;
  english: English2[];
  japanese: English2[];
}

interface English2 {
  flavor_text: string;
}

interface Pokemonv2pokemonability {
  pokemon_v2_ability: Pokemonv2ability;
}

interface Pokemonv2ability {
  name: string;
  english: English[];
  japanese: English[];
}

interface English {
  flavor_text: string;
  language_id: number;
}

interface Pokemonv2pokemontype {
  pokemon_v2_type: Pokemonv2type;
}

interface Pokemonv2pokemonmove {
  pokemon_v2_move: Pokemonv2move;
}

interface Pokemonv2move {
  name: string;
  accuracy?: number;
  power?: number;
  pp: number;
  pokemon_v2_type: Pokemonv2type;
}

interface Pokemonv2type {
  name: string;
}

export const GET_POKEMON_DETAILS = gql<PokemonDetailsResponse, { id: number }>`
query getPokemonDetails($id: Int!) {
  pokemon_v2_pokemon(where: {id: {_eq: $id}}) {
    id
    name
    height
    weight
    order
    pokemon_v2_pokemonstats {
      base_stat
      pokemon_v2_stat {
        name
      }
    }
    pokemon_v2_pokemonmoves(distinct_on: move_id) {
      pokemon_v2_move {
        name
        accuracy
        power
        pp
        pokemon_v2_type {
          name
        }
      }
    }
    pokemon_v2_pokemontypes {
      pokemon_v2_type {
        name
      }
    }
    pokemon_v2_pokemonabilities {
      pokemon_v2_ability {
        name
        english: pokemon_v2_abilityflavortexts(where: {language_id: {_eq: 9}}, limit: 1) {
          flavor_text
          language_id
        }
        japanese: pokemon_v2_abilityflavortexts(where: {language_id: {_eq: 1}}, limit: 1) {
          flavor_text
          language_id
        }
      }
    }
    pokemon_v2_pokemonspecy {
      base_happiness
      capture_rate
      gender_rate
      pokemon_v2_pokemoncolor {
        name
      }
      pokemon_v2_pokemonshape {
        name
      }
      pokemon_v2_pokemonhabitat {
        name
      }
      english:pokemon_v2_pokemonspeciesflavortexts(where: {language_id: {_eq: 9}}, limit: 1) {
        flavor_text
      }
      japanese:pokemon_v2_pokemonspeciesflavortexts(where: {language_id: {_eq: 1}}, limit: 1) {
        flavor_text
      }
    }
  }
}
`;