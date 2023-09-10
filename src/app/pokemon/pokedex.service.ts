import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PokeList, Pokemon, PokemonList } from './pokemon.model';

@Injectable()
export class PokedexService {
  private readonly baseUrl = 'https://pokeapi.co/api/v2';
  private readonly imageUrl =
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';

  constructor(private http: HttpClient) {}

  getPokemon(offset = 0): Observable<PokeList> {
    return this.http
      .get<PokemonList>(`${this.baseUrl}/pokemon?offset=${offset}&limit=100`)
      .pipe(
        map((result: PokemonList) =>
          result?.results?.map((poke, index) => {
            return {
              ...poke,
              image: this.getPokeImage(offset + index + 1),
              pokeIndex: offset + index + 1,
            };
          })
        )
      );
  }

  getPokeImage(index: number): string {
    return `${this.imageUrl}${index}.png`;
  }

  getPokeDetails(index: number): Observable<Pokemon> {
    return this.http.get<Pokemon>(`${this.baseUrl}/pokemon/${index}`);
  }
}
