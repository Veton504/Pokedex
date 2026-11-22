const BASE_URL = "https://pokeapi.co/api/v2/pokemon";
let loadedPokemon = [];

async function loadPokemonList() {
  let response = await fetch(BASE_URL + "?limit=20&offset=0");
  let data = await response.json();
  for (let i = 0; i < data.results.length; i++) {
    let pokemon = await loadPokemonDetails(data.results[i].url);
    loadedPokemon.push(pokemon);
  }
  renderPokemonList();
}

async function loadPokemonDetails(url) {
  let response = await fetch(url);
  return await response.json();
}

function renderPokemonList() {
  let list = document.getElementById("pokemonList");
  list.innerHTML = "";
  for (let i = 0; i < loadedPokemon.length; i++) {
    list.innerHTML += getPokemonCardTemplate(loadedPokemon[i]);
  }
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// NEU
function getPokemonImage(pokemon) {
  return pokemon.sprites.other["official-artwork"].front_default;
}

function getPokemonCardTemplate(pokemon) {
  return `
    <li>
      <img src="${getPokemonImage(pokemon)}" alt="${capitalize(pokemon.name)}" data-id="card-image" width="120"> <!-- NEU -->
      <p>${capitalize(pokemon.name)}</p>
    </li>`;
}

loadPokemonList();
