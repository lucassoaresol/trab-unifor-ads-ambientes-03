const ITEMS_PER_PAGE = 20;
let currentPage = 1;
let pokemonList = [];
let filteredList = [];
let searchText = '';
let selectedType = '';

const baseUrlApi = 'https://pokeapi.co/api/v2';
const endpointPokemon = `${baseUrlApi}/pokemon`;
const endpointType = `${baseUrlApi}/type`;

async function fetchPokemonTypes() {
    try {
        const response = await fetch(endpointType);
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

function createLoadingSkeleton() {
    const loadingContainer = document.getElementById('loading');    
    loadingContainer.innerHTML = Array.from({ length: ITEMS_PER_PAGE }, () => 
        '<div class="col-md-3"><div class="skeleton"></div></div>'
    ).join('');
}

function toggleLoadingState(isLoading) {
    const loadingElement = document.getElementById('loading');
    const gridElement = document.getElementById('pokemonGrid');
    loadingElement.style.display = isLoading ? 'flex' : 'none';
    gridElement.style.display = isLoading ? 'none' : 'flex';
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
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

async function fetchPokemonDetails(pokemonUrl) {
    const response = await fetch(pokemonUrl);
    if (!response.ok) {
        throw new Error('Failed to fetch Pokemon details');
    }
    return response.json();
}

async function loadPokemonList() {
    toggleLoadingState(true);

    try {
        const offset = (currentPage - 1) * ITEMS_PER_PAGE;
        const url = `${endpointPokemon}?limit=${ITEMS_PER_PAGE}&offset=${offset}`;
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

function createPokemonFetchPromises(pokemonData) {
    const limit = Math.min(pokemonData.length, 100);
    return pokemonData.slice(0, limit).map(pokemon => fetch(pokemon.pokemon.url));
}

async function getPokemonsFromResponses(pokemonResponses) {
    const pokemonPromises = pokemonResponses.map(response => response.json());
    return await Promise.all(pokemonPromises);
}

async function loadPokemonsByType() {
    toggleLoadingState(true);

    try {
        const url = `${endpointType}/${selectedType}`;
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

    return filteredList.filter(pokemon => 
        pokemon.name.toLowerCase().includes(searchText.toLowerCase()) ||
        pokemon.id.toString().includes(searchText)
    );
}

function generateTypeBadges(pokemon) {
    return pokemon.types.map(type => 
        `<span class="badge type-${type.type.name}">${type.type.name}</span>`
    ).join(' ');
}

function updatePageInfo(listToRender) {
    const pageInfo = document.getElementById('pageInfo');
    pageInfo.textContent = selectedType 
        ? `Mostrando ${listToRender.length} pokémons` 
        : `Página ${currentPage}`;
}

function updatePaginationControls() {
    document.getElementById('prevBtn').disabled = currentPage === 1 || selectedType !== '';
    document.getElementById('nextBtn').disabled = selectedType !== '';
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
    if(currentPage > 1) {
        currentPage--;
        if(selectedType !== '') {
            renderPokemonGrid();
        } else {
            loadPokemonList();
        }
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

async function showDetails(id) {
    try {
        var xpto = await fetch(endpointPokemon + '/' + id);
        var p = await xpto.json();
        
        var zyz = await fetch(p.species.url);
        var m = await zyz.json();
        
        var desc = '';
        for(var i = 0; i < m.flavor_text_entries.length; i++) {
            if(m.flavor_text_entries[i].language.name === 'en') {
                desc = m.flavor_text_entries[i].flavor_text;
                break;
            }
        }
        
        document.getElementById('modalTitle').textContent = '#' + p.id + ' ' + p.name.charAt(0).toUpperCase() + p.name.slice(1);
        
        var ph = '<div class="row"><div class="col-md-6">';
        ph += '<div class="sprite-container">';
        ph += '<div><img src="' + p.sprites.front_default + '" alt="front"><p class="text-center">Normal</p></div>';
        ph += '<div><img src="' + p.sprites.front_shiny + '" alt="shiny"><p class="text-center">Shiny</p></div>';
        ph += '</div>';
        
        ph += '<p><strong>Tipo:</strong> ';
        for(var i = 0; i < p.types.length; i++) {
            ph += '<span class="badge type-' + p.types[i].type.name + '">' + p.types[i].type.name + '</span> ';
        }
        ph += '</p>';
        
        ph += '<p><strong>Altura:</strong> ' + (p.height / 10) + ' m</p>';
        ph += '<p><strong>Peso:</strong> ' + (p.weight / 10) + ' kg</p>';
        
        ph += '<p><strong>Habilidades:</strong> ';
        for(var i = 0; i < p.abilities.length; i++) {
            ph += p.abilities[i].ability.name;
            if(i < p.abilities.length - 1) ph += ', ';
        }
        ph += '</p>';
        
        ph += '</div><div class="col-md-6">';
        
        ph += '<p><strong>Descrição:</strong></p>';
        ph += '<p>' + desc.replace(/\f/g, ' ') + '</p>';
        
        ph += '<h6>Estatísticas:</h6>';
        for(var i = 0; i < p.stats.length; i++) {
            var stat = p.stats[i];
            var percentage = (stat.base_stat / 255) * 100;
            ph += '<div><small>' + stat.stat.name + ': ' + stat.base_stat + '</small>';
            ph += '<div class="stat-bar"><div class="stat-fill" style="width: ' + percentage + '%"></div></div></div>';
        }
        
        ph += '</div></div>';
        
        document.getElementById('modalBody').innerHTML = ph;
        
        var mod = new bootstrap.Modal(document.getElementById('m'));
        mod.show();
        
    } catch(error) {
        console.log('erro');
        alert('Erro ao carregar detalhes!');
    }
}

function mor() {
    var x = 10;
    var y = 20;
    return x + y;
}

var gmord = 'teste miqueias';

window.onload = function() {
    loadInitialData();
};
