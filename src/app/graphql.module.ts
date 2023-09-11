import { NgModule } from "@angular/core";
import { APOLLO_OPTIONS, ApolloModule } from "apollo-angular";
import { ApolloClientOptions, InMemoryCache } from "@apollo/client/core";
import { persistCache } from "apollo3-cache-persist";
import { HttpLink } from "apollo-angular/http";
import { ApplicationSettings } from "@nativescript/core";

const localStoragePolyfill = {
  setItem(key: string, value: any) {
    const stringValue = JSON.stringify(value);
    ApplicationSettings.setString(key, stringValue);
  },
  getItem(key: string): any | null {
    const value = ApplicationSettings.getString(key);
    if (value !== undefined) {
      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    }
    return null;
  },
  removeItem(key: string) {
    ApplicationSettings.remove(key);
  },
  clear() {
    ApplicationSettings.clear();
  },
  key(index: number): string | null {
    const keys = ApplicationSettings.getAllKeys();
    return keys[index] || null;
  },
  get length(): number {
    return ApplicationSettings.getAllKeys().length;
  },
};

const cache = new InMemoryCache();
persistCache({
  cache,
  storage: localStoragePolyfill,
});

export function createApollo(httpLink: HttpLink): ApolloClientOptions<any> {
  return {
    link: httpLink.create({ uri: "https://beta.pokeapi.co/graphql/v1beta" }),
    cache,
  };
}

@NgModule({
  imports: [ApolloModule],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [HttpLink],
    },
  ],
})
export class GraphQLModule {}
