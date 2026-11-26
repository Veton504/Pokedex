const BASE_URL = "https://pokeapi.co/api/v2/pokemon";
const PAGE_SIZE = 20;
let loadedPokemon = [];
let shownPokemon = [];
let evolutionCache = {};
let offset = 0;
let currentIndex = 0;

async function loadPokemonList() {
  setLoading(true);
  let response = await fetch(
    BASE_URL + "?limit=" + PAGE_SIZE + "&offset=" + offset,
  );
  let data = await response.json();
  await loadAndStorePokemon(data.results);
  offset += PAGE_SIZE;
  shownPokemon = loadedPokemon;
  renderPokemonList();
  setLoading(false);
}

async function loadAndStorePokemon(results) {
  for (let i = 0; i < results.length; i++) {
    let pokemon = await loadPokemonDetails(results[i].url);
    loadedPokemon.push(pokemon);
  }
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

async function loadEvolutionChain(pokemon) {
  if (evolutionCache[pokemon.name]) {
    return evolutionCache[pokemon.name];
  }
  let speciesResponse = await fetch(pokemon.species.url);
  let species = await speciesResponse.json();
  let chainResponse = await fetch(species.evolution_chain.url);
  let chainData = await chainResponse.json();
  evolutionCache[pokemon.name] = chainData.chain;
  return chainData.chain;
}


function getEvolutionNames(chain) {
  let names = [capitalize(chain.species.name)];
  let next = chain.evolves_to[0];
  while (next) {
    names.push(capitalize(next.species.name));
    next = next.evolves_to[0];
  }
  return names;
}

function renderPokemonList() {
  let list = document.getElementById("pokemonList");
  list.innerHTML = "";
  if (shownPokemon.length === 0) {
    list.innerHTML = getNotFoundTemplate();
  }
  for (let i = 0; i < shownPokemon.length; i++) {
    list.innerHTML += getPokemonCardTemplate(shownPokemon[i], i);
  }
}

function searchPokemon() {
  let term = document.getElementById("searchInput").value.trim().toLowerCase();
  if (term.length === 0) {
    shownPokemon = loadedPokemon;
    renderPokemonList();
    return;
  }
  if (term.length < 3) {
    return;
  }
  shownPokemon = loadedPokemon.filter((pokemon) => pokemon.name.includes(term));
  renderPokemonList();
}

function openDialog(index) {
  currentIndex = index;
  renderDialogContent();
  document.getElementById("pokemonDialog").showModal();
}

function renderDialogContent() {
  
  let pokemon = shownPokemon[currentIndex];
  document.getElementById("dialogContent").innerHTML =
    getDialogTemplate(pokemon);
  renderEvolution(pokemon); // NEU
}


async function renderEvolution(pokemon) {
  let chain = await loadEvolutionChain(pokemon);
  if (shownPokemon[currentIndex] !== pokemon) {
    return;
  }
  let names = getEvolutionNames(chain).join(" → ");
  document.getElementById("evolution").textContent = "Evolution: " + names;
}

function showNextPokemon() {
  currentIndex++;
  if (currentIndex >= shownPokemon.length) {
    currentIndex = 0;
  }
  renderDialogContent();
}

function showPreviousPokemon() {
  currentIndex--;
  if (currentIndex < 0) {
    currentIndex = shownPokemon.length - 1;
  }
  renderDialogContent();
}

function closeDialog() {
  document.getElementById("pokemonDialog").close();
}

function closeDialogOnOutsideClick(event) {
  if (event.target.id === "pokemonDialog") {
    closeDialog();
  }
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
    <div data-id="overlay-pokemon-name" class="dialog-card type-${pokemon.types[0].type.name}">
      <h2>${capitalize(pokemon.name)}</h2>
      <img src="${getPokemonImage(pokemon)}" alt="${capitalize(pokemon.name)}" data-id="dialog-image" width="200">
      <div>${getTypesTemplate(pokemon)}</div>
      <div>${getStatsTemplate(pokemon)}</div>
      <p id="evolution">Loading evolution...</p> <!-- NEU -->
    </div>`;
}

function getNotFoundTemplate() {
  return `<li><p data-id="not-found">No match found.</p></li>`;
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
document
  .getElementById("pokemonDialog")
  .addEventListener("click", closeDialogOnOutsideClick);
document
  .getElementById("nextButton")
  .addEventListener("click", showNextPokemon);
document
  .getElementById("prevButton")
  .addEventListener("click", showPreviousPokemon);
document
  .getElementById("searchButton")
  .addEventListener("click", searchPokemon);

loadPokemonList();
