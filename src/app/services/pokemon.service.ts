import { Injectable, inject } from "@angular/core";
import { Apollo } from "apollo-angular";
import { GET_POKEMON } from "./gql/get-pokemon.gql";
import { GET_POKEMON_DETAILS } from "./gql/get-pokemon-details.gql";
import { map, shareReplay, take, tap } from "rxjs";

@Injectable()
export class PokemonService {
  private apollo = inject(Apollo);
  activeDetail;

  getPokemonSprite(index: number): string {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${index}.png`;
  }
  getPokemonImage(index: number): string {
    // return `https://img.pokemondb.net/artwork/large/${pokemonName}.jpg`;
    return `https://raw.githubusercontent.com/HybridShivam/Pokemon/master/assets/thumbnails/${index
      .toString()
      .padStart(3, "0")}.png`;
  }

  getPokemon() {
    return this.apollo
      .watchQuery({
        query: GET_POKEMON,
        variables: {
          limit: 905,
          offset: 0,
        },
      })
      .valueChanges.pipe(
        map((result) =>
          result?.data?.pokemon_v2_pokemon?.map((pokemon) => ({
            ...pokemon,
            image: this.getPokemonImage(pokemon.id),
            sprite: this.getPokemonSprite(pokemon.id),
          }))
        )
      );
  }

  getDetail(id: number) {
    return this
      .getPokemonDetails(id)
      .pipe(take(1));
  }

  getPokemonDetails(id: number) {
    return this.apollo
      .watchQuery({
        query: GET_POKEMON_DETAILS,
        variables: {
          id,
        },
      })
      .valueChanges.pipe(
        map((result) => result?.data?.pokemon_v2_pokemon[0]),
        map((pokemon) => ({
          ...pokemon,
          stats: pokemon?.pokemon_v2_pokemonstats?.map((stat) => ({
            ...stat.pokemon_v2_stat,
            base_stat: stat.base_stat,
          })),
          moves: pokemon?.pokemon_v2_pokemonmoves?.map((move) => ({
            ...move.pokemon_v2_move,
            type: move.pokemon_v2_move.pokemon_v2_type?.name,
          })),
          types: pokemon?.pokemon_v2_pokemontypes?.map(
            (type) => type.pokemon_v2_type?.name
          ),
          abilities: pokemon?.pokemon_v2_pokemonabilities?.map((ability) => ({
            ...ability.pokemon_v2_ability,
            english: ability.pokemon_v2_ability.english?.[0]?.flavor_text,
            japanese: ability.pokemon_v2_ability.japanese?.[0]?.flavor_text,
          })),
          species: {
            ...pokemon?.pokemon_v2_pokemonspecy,
            color:
              pokemon?.pokemon_v2_pokemonspecy.pokemon_v2_pokemoncolor?.name ??
              "Unknown",
            shape:
              pokemon?.pokemon_v2_pokemonspecy.pokemon_v2_pokemonshape?.name ??
              "Unknown",
            habitat:
              pokemon?.pokemon_v2_pokemonspecy.pokemon_v2_pokemonhabitat
                ?.name ?? "Unknown",
            english: pokemon?.pokemon_v2_pokemonspecy.english?.[0]?.flavor_text
              .replaceAll("\n", " ")
              .replaceAll("\f", " "),
            japanese:
              pokemon?.pokemon_v2_pokemonspecy.japanese?.[0]?.flavor_text
                .replaceAll("\n", " ")
                .replaceAll("\f", " "),
            evolutions: pokemon?.pokemon_v2_pokemonspecy.pokemon_v2_evolutionchain?.pokemon_v2_pokemonspecies?.map(
              (evolution) => ({
                ...evolution,
                image: this.getPokemonImage(evolution.id),
                sprite: this.getPokemonSprite(evolution.id),
              })
            ).sort((a, b) => a.order - b.order)
          },
          weight: pokemon?.weight / 10,
          height: pokemon?.height / 10,
          image: this.getPokemonImage(pokemon.id),
          sprite: this.getPokemonSprite(pokemon.id),
        }))
      );
  }
}
