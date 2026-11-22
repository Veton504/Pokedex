const BASE_URL = "https://pokeapi.co/api/v2/pokemon";

async function loadPokemonList() {
  let response = await fetch(BASE_URL + "?limit=20&offset=0");
  let data = await response.json();
  for (let i = 0; i < data.results.length; i++) {
    let pokemon = await loadPokemonDetails(data.results[i].url);
    console.log(pokemon.name, pokemon.types[0].type.name);
  }
}

async function loadPokemonDetails(url) {
  let response = await fetch(url);
  return await response.json();
}

loadPokemonList();
