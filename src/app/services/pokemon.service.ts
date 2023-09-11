import { Injectable, inject } from "@angular/core";
import { Apollo } from "apollo-angular";
import { GET_POKEMON } from "./gql/get-pokemon.gql";
import { GET_POKEMON_DETAILS } from "./gql/get-pokemon-details.gql";
import { map, tap } from "rxjs";

@Injectable()
export class PokemonService {
  private apollo = inject(Apollo);
  private readonly imageUrl =
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/";

  getPokemonImage(index: number): string {
    return `${this.imageUrl}${index}.png`;
  }

  getPokemon(offset: number) {
    return this.apollo.watchQuery({
      query: GET_POKEMON,
      variables: {
        limit: 100,
        offset,
      },
    }).valueChanges.pipe(
      map((result) =>
        result?.data?.pokemon_v2_pokemon?.map((pokemon) => ({
          ...pokemon,
          image: this.getPokemonImage(pokemon.id),
        }))
      )
    );
  }

  getPokemonDetails(id: number) {
    return this.apollo.watchQuery({
      query: GET_POKEMON_DETAILS,
      variables: {
        id,
      },
    }).valueChanges.pipe(
      map((result) => result?.data?.pokemon_v2_pokemon[0]),
      map((pokemon) => ({
        ...pokemon,
        stats: pokemon?.pokemon_v2_pokemonstats?.map((stat) => ({
          ...stat.pokemon_v2_stat,
          base_stat: stat.base_stat,
        })),
        moves: pokemon?.pokemon_v2_pokemonmoves?.map((move) => ({
          ...move.pokemon_v2_move,
          type: move.pokemon_v2_move.pokemon_v2_type.name,
        })),
        types: pokemon?.pokemon_v2_pokemontypes?.map(
          (type) => type.pokemon_v2_type.name
        ),
        abilities: pokemon?.pokemon_v2_pokemonabilities?.map((ability) => ({
          ...ability.pokemon_v2_ability,
          english: ability.pokemon_v2_ability.english[0].flavor_text,
          japanese: ability.pokemon_v2_ability.japanese[0].flavor_text,
        })),
        species: {
          ...pokemon?.pokemon_v2_pokemonspecy,
          color: pokemon?.pokemon_v2_pokemonspecy.pokemon_v2_pokemoncolor.name,
          shape: pokemon?.pokemon_v2_pokemonspecy.pokemon_v2_pokemonshape.name,
          habitat: pokemon?.pokemon_v2_pokemonspecy.pokemon_v2_pokemonhabitat.name,
          english: pokemon?.pokemon_v2_pokemonspecy.english[0].flavor_text.replaceAll("\n", " ").replaceAll("\f", " "),
          japanese: pokemon?.pokemon_v2_pokemonspecy.japanese[0].flavor_text.replaceAll("\n", " ").replaceAll("\f", " ")
        },
        weight: pokemon?.weight / 10,
        height: pokemon?.height / 10,
        image: this.getPokemonImage(pokemon.id),
      })),
    );
  }
}
