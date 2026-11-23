const BASE_URL = "https://pokeapi.co/api/v2/pokemon";
const PAGE_SIZE = 20;
let loadedPokemon = [];
let offset = 0;

async function loadPokemonList() {
  setLoading(true);
  let response = await fetch(
    BASE_URL + "?limit=" + PAGE_SIZE + "&offset=" + offset,
  );
  let data = await response.json();
  for (let i = 0; i < data.results.length; i++) {
    let pokemon = await loadPokemonDetails(data.results[i].url);
    loadedPokemon.push(pokemon);
  }
  offset += PAGE_SIZE;
  renderPokemonList();
  setLoading(false);
}

function setLoading(isLoading) {
  let button = document.getElementById("loadMoreButton");
  let loadingScreen = document.getElementById("loadingScreen");
  button.disabled = isLoading;
  button.textContent = isLoading ? "Loading..." : "Load more";
  loadingScreen.classList.toggle("d-none", !isLoading);
}

async function loadPokemonDetails(url) {
  let response = await fetch(url);
  return await response.json();
}

function renderPokemonList() {
  let list = document.getElementById("pokemonList");
  list.innerHTML = "";
  for (let i = 0; i < loadedPokemon.length; i++) {
    list.innerHTML += getPokemonCardTemplate(loadedPokemon[i], i);
  }
}

function openDialog(index) {
  let pokemon = loadedPokemon[index];
  document.getElementById("dialogContent").innerHTML =
    getDialogTemplate(pokemon);
  document.getElementById("pokemonDialog").showModal();
}

function closeDialog() {
  document.getElementById("pokemonDialog").close();
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function getPokemonImage(pokemon) {
  return pokemon.sprites.other["official-artwork"].front_default;
}

function getTypesTemplate(pokemon) {
  let typesHtml = "";
  for (let i = 0; i < pokemon.types.length; i++) {
    typesHtml += `<span>${capitalize(pokemon.types[i].type.name)}</span> `;
  }
  return typesHtml;
}

// NEU
function getStatsTemplate(pokemon) {
  let statsHtml = "";
  for (let i = 0; i < pokemon.stats.length; i++) {
    let stat = pokemon.stats[i];
    statsHtml += `<p>${capitalize(stat.stat.name)}: ${stat.base_stat}</p>`;
  }
  return statsHtml;
}

function getDialogTemplate(pokemon) {
  return `
    <div data-id="overlay-pokemon-name">
      <h2>${capitalize(pokemon.name)}</h2>
      <img src="${getPokemonImage(pokemon)}" alt="${capitalize(pokemon.name)}" data-id="dialog-image" width="200">
      <div>${getTypesTemplate(pokemon)}</div>
      <div>${getStatsTemplate(pokemon)}</div> <!-- NEU -->
    </div>`;
}

function getPokemonCardTemplate(pokemon, index) {
  return `
    <li class="type-${pokemon.types[0].type.name}">
      <button data-id="card" onclick="openDialog(${index})" aria-label="Open details of ${capitalize(pokemon.name)}">
        <img src="${getPokemonImage(pokemon)}" alt="${capitalize(pokemon.name)}" data-id="card-image" width="120">
        <p>${capitalize(pokemon.name)}</p>
        <div>${getTypesTemplate(pokemon)}</div>
      </button>
    </li>`;
}

document
  .getElementById("loadMoreButton")
  .addEventListener("click", loadPokemonList);
document
  .getElementById("closeDialogButton")
  .addEventListener("click", closeDialog);

loadPokemonList();
