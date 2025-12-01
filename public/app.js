const ITEMS_PER_PAGE = 20;
const BASE_URL_API = 'https://pokeapi.co/api/v2';
const ENDPOINT_POKEMON = `${BASE_URL_API}/pokemon`;
const ENDPOINT_TYPE = `${BASE_URL_API}/type`;

let currentPage = 1;
let pokemonList = [];
let filteredList = [];
let searchText = '';
let selectedType = '';

function capitalizeFirstLetter(text) {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function toggleLoadingState(isLoading) {
    const loadingElement = document.getElementById('loading');
    const gridElement = document.getElementById('pokemonGrid');

    loadingElement.style.display = isLoading ? 'flex' : 'none';
    gridElement.style.display = isLoading ? 'none' : 'flex';
}

function createLoadingSkeleton() {
    const loadingContainer = document.getElementById('loading');

    const skeletonMarkup = Array.from({ length: ITEMS_PER_PAGE }, () =>
        '<div class="col-md-3"><div class="skeleton"></div></div>'
    ).join('');

    loadingContainer.innerHTML = skeletonMarkup;
}

function getEnglishDescription(flavorTextEntries) {
    if (!Array.isArray(flavorTextEntries)) return '';

    const englishEntry = flavorTextEntries.find(
        entry => entry.language?.name === 'en'
    );

    if (!englishEntry) return '';

    return englishEntry.flavor_text.replace(/\f/g, ' ');
}

function buildSpriteSection(sprites) {
    return `
        <div class="sprite-container">
            <div>
                <img src="${sprites.front_default}" alt="front">
                <p class="text-center">Normal</p>
            </div>
            <div>
                <img src="${sprites.front_shiny}" alt="shiny">
                <p class="text-center">Shiny</p>
            </div>
        </div>
    `;
}

function buildTypeSection(types) {
    const badges = types
        .map(typeInfo => {
            const typeName = typeInfo.type.name;
            return `<span class="badge type-${typeName}">${typeName}</span>`;
        })
        .join(' ');

    return `
        <p>
            <strong>Tipo:</strong> 
            ${badges}
        </p>
    `;
}

function buildHeightWeightSection(heightDecimeters, weightHectograms) {
    const heightInMeters = heightDecimeters / 10;
    const weightInKg = weightHectograms / 10;

    return `
        <p><strong>Altura:</strong> ${heightInMeters} m</p>
        <p><strong>Peso:</strong> ${weightInKg} kg</p>
    `;
}

function buildAbilitiesSection(abilities) {
    const abilityNames = abilities
        .map(item => item.ability.name)
        .join(', ');

    return `
        <p>
            <strong>Habilidades:</strong> 
            ${abilityNames}
        </p>
    `;
}

function buildDescriptionSection(description) {
    return `
        <p><strong>Descrição:</strong></p>
        <p>${description || 'Descrição não disponível.'}</p>
    `;
}

function buildStatsSection(stats) {
    const statsMarkup = stats
        .map(stat => {
            const percentage = (stat.base_stat / 255) * 100;

            return `
                <div>
                    <small>${stat.stat.name}: ${stat.base_stat}</small>
                    <div class="stat-bar">
                        <div class="stat-fill" style="width: ${percentage}%;"></div>
                    </div>
                </div>
            `;
        })
        .join('');

    return `
        <h6>Estatísticas:</h6>
        ${statsMarkup}
    `;
}

async function fetchPokemonTypes() {
    try {
        const response = await fetch(ENDPOINT_TYPE);

        if (!response.ok) {
            throw new Error(`Failed to fetch Pokemon types. Status: ${response.status}`);
        }

        const data = await response.json();
        return data.results ?? [];
    } catch (error) {
        console.error('Error fetching Pokemon types:', error);
        return [];
    }
}

async function fetchPokemonDetails(pokemonUrl) {
    const response = await fetch(pokemonUrl);

    if (!response.ok) {
        throw new Error('Failed to fetch Pokemon details');
    }

    return response.json();
}

async function fetchPokemonById(id) {
    const response = await fetch(`${ENDPOINT_POKEMON}/${id}`);

    if (!response.ok) {
        throw new Error(`Failed to fetch Pokémon. Status: ${response.status}`);
    }

    return response.json();
}

async function fetchPokemonSpecies(speciesUrl) {
    const response = await fetch(speciesUrl);

    if (!response.ok) {
        throw new Error(`Failed to fetch species. Status: ${response.status}`);
    }

    return response.json();
}

function createPokemonFetchPromises(pokemonData) {
    const limit = Math.min(pokemonData.length, 100);
    return pokemonData.slice(0, limit).map(pokemon => fetch(pokemon.pokemon.url));
}

async function getPokemonsFromResponses(pokemonResponses) {
    const pokemonPromises = pokemonResponses.map(response => response.json());
    return await Promise.all(pokemonPromises);
}

function populateTypeOptions(types) {
    const typeSelect = document.getElementById('typeFilter');

    types.forEach(type => {
        const option = document.createElement('option');
        option.value = type.name;
        option.textContent = capitalizeFirstLetter(type.name);
        typeSelect.appendChild(option);
    });
}

async function loadInitialData() {
    createLoadingSkeleton();

    const types = await fetchPokemonTypes();
    if (types.length) {
        populateTypeOptions(types);
    } else {
        console.log('No types available or failed to load.');
    }

    await loadPokemonList();
}

async function loadPokemonList() {
    toggleLoadingState(true);

    try {
        const offset = (currentPage - 1) * ITEMS_PER_PAGE;
        const url = `${ENDPOINT_POKEMON}?limit=${ITEMS_PER_PAGE}&offset=${offset}`;

        const response = await fetch(url);
        const data = await response.json();

        const pokemonPromises = data.results.map(pokemon => fetchPokemonDetails(pokemon.url));
        pokemonList = await Promise.all(pokemonPromises);
        filteredList = [...pokemonList];

        renderPokemonGrid();
    } catch (error) {
        console.log('erro ao carregar');
        alert('Erro ao carregar Pokémons!');
    } finally {
        toggleLoadingState(false);
    }
}

async function loadPokemonsByType() {
    toggleLoadingState(true);

    try {
        const url = `${ENDPOINT_TYPE}/${selectedType}`;
        const response = await fetch(url);
        const data = await response.json();

        const pokemonPromises = createPokemonFetchPromises(data.pokemon);
        const pokemonResponses = await Promise.all(pokemonPromises);
        
        pokemonList = await getPokemonsFromResponses(pokemonResponses);
        filteredList = [...pokemonList];

        renderPokemonGrid();
    } catch (error) {
        console.log('Erro ao carregar Pokémons por tipo');
        alert('Erro ao carregar Pokémons do tipo!');
    } finally {
        toggleLoadingState(false);
    }
}

function getFilteredPokemonList() {
    if (!searchText) return filteredList;

    const normalizedSearch = searchText.toLowerCase();

    return filteredList.filter(pokemon => 
        pokemon.name.toLowerCase().includes(normalizedSearch) ||
        pokemon.id.toString().includes(searchText)
    );
}

async function filterPokemon() {
    searchText = document.getElementById('s').value;
    selectedType = document.getElementById('typeFilter').value;

    if(selectedType !== '') {
        await loadPokemonsByType();
    } else {
        renderPokemonGrid();
    }
}

function clearFilter() {
    document.getElementById('s').value = '';
    document.getElementById('typeFilter').value = '';

    searchText = '';
    selectedType = '';
    currentPage = 1;

    loadPokemonList();
}

function backPage() {
    if (currentPage <= 1) return;

    currentPage--;

    if (selectedType !== '') {
        renderPokemonGrid();
    } else {
        loadPokemonList();
    }
}

function nextPage() {
    currentPage++;

    if(selectedType !== '') {
        renderPokemonGrid();
    } else {
        loadPokemonList();
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark');
}

function updatePageInfo(listToRender) {
    const pageInfo = document.getElementById('pageInfo');

    pageInfo.textContent = selectedType 
        ? `Mostrando ${listToRender.length} pokémons` 
        : `Página ${currentPage}`;
}

function updatePaginationControls() {
    const prevButton = document.getElementById('prevBtn');
    const nextButton = document.getElementById('nextBtn');

    prevButton.disabled = currentPage === 1 || selectedType !== '';
    nextButton.disabled = selectedType !== '';
}

function generateTypeBadges(pokemon) {
    return pokemon.types.map(type => 
        `<span class="badge type-${type.type.name}">${type.type.name}</span>`
    ).join(' ');
}

function createPokemonCard(pokemon) {
    const container = document.createElement('div');
    container.className = 'col-md-3';

    container.innerHTML = `
        <div class="c" onclick="showDetails(${pokemon.id})">
            <img src="${pokemon.sprites.front_default}" class="i" alt="${pokemon.name}">
            <h5 class="text-center">#${pokemon.id} ${capitalizeFirstLetter(pokemon.name)}</h5>
            <div class="text-center">
                ${generateTypeBadges(pokemon)}
            </div>
        </div>
    `;

    return container;
}

function renderPokemonGrid() {
    const grid = document.getElementById('pokemonGrid');
    grid.innerHTML = '';

    const listToRender = getFilteredPokemonList();
    listToRender.forEach(pokemon => grid.appendChild(createPokemonCard(pokemon)));
    
    updatePageInfo(listToRender);
    updatePaginationControls();
}

function renderPokemonModal(pokemon, description) {
    const modalTitleElement = document.getElementById('modalTitle');
    const modalBodyElement = document.getElementById('modalBody');

    modalTitleElement.textContent = `#${pokemon.id} ${capitalizeFirstLetter(pokemon.name)}`;

    modalBodyElement.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                ${buildSpriteSection(pokemon.sprites)}
                ${buildTypeSection(pokemon.types)}
                ${buildHeightWeightSection(pokemon.height, pokemon.weight)}
                ${buildAbilitiesSection(pokemon.abilities)}
            </div>
            <div class="col-md-6">
                ${buildDescriptionSection(description)}
                ${buildStatsSection(pokemon.stats)}
            </div>
        </div>
    `;

    const modalInstance = new bootstrap.Modal(document.getElementById('m'));
    modalInstance.show();
}

async function showDetails(id) {
    try {
        const pokemon = await fetchPokemonById(id);
        const species = await fetchPokemonSpecies(pokemon.species.url);
        const description = getEnglishDescription(species.flavor_text_entries);

        renderPokemonModal(pokemon, description);
    } catch (error) {
        console.error('Erro ao carregar detalhes do Pokémon:', error);
        alert('Erro ao carregar detalhes!');
    }
}

window.onload = function() {
    loadInitialData();
};
