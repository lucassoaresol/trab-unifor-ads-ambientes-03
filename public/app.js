let pokemonList = [];
let filteredList = [];
let currentPage = 1;
const ITEMS_PER_PAGE = 20;
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
    loadingContainer.innerHTML = '';
    
    const skeletonHTML = Array.from({ length: ITEMS_PER_PAGE }, () => 
        '<div class="col-md-3"><div class="skeleton"></div></div>'
    ).join('');
    
    loadingContainer.innerHTML = skeletonHTML;
}

function populateTypeOptions(types) {
    const typeSelect = document.getElementById('typeFilter');
    types.forEach(type => {
        const option = document.createElement('option');
        option.value = type.name;
        option.textContent = type.name.charAt(0).toUpperCase() + type.name.slice(1);
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
    document.getElementById('loading').style.display = 'flex';
    document.getElementById('pokemonGrid').style.display = 'none';

    try {
        var offset = (currentPage - 1) * ITEMS_PER_PAGE;
        var url = endpointPokemon + '?limit=' + ITEMS_PER_PAGE + '&offset=' + offset;
        var response = await fetch(url);
        var data = await response.json();

        var promises = [];
        for (var index = 0; index < data.results.length; index++) {
            promises.push(fetch(data.results[index].url));
        }

        var pokemonResponses = await Promise.all(promises);
        pokemonList = [];
        for (var index = 0; index < pokemonResponses.length; index++) {
            var pokemon = await pokemonResponses[index].json();
            pokemonList.push(pokemon);
        }

        filteredList = [...pokemonList];
        renderPokemonGrid();
    } catch (error) {
        console.log('erro ao carregar');
        alert('Erro ao carregar Pokémons!');
    }
}

async function loadByType() {
    document.getElementById('loading').style.display = 'flex';
    document.getElementById('pokemonGrid').style.display = 'none';

    try {
        var url = endpointType + '/' + selectedType;
        var response = await fetch(url);
        var data = await response.json();

        var typePromises = [];
        var limit = data.pokemon.length > 100 ? 100 : data.pokemon.length;
        for (var index = 0; index < limit; index++) {
            typePromises.push(fetch(data.pokemon[index].pokemon.url));
        }

        var pokemonResponses = await Promise.all(typePromises);
        pokemonList = [];

        for (var index = 0; index < pokemonResponses.length; index++) {
            var pokemon = await pokemonResponses[index].json();
            pokemonList.push(pokemon);
        }

        filteredList = [...pokemonList];
        renderPokemonGrid();
    } catch (error) {
        console.log('erro ao carregar tipo');
        alert('Erro ao carregar Pokémons do tipo!');
    }
}


function renderPokemonGrid() {
    var grid = document.getElementById('pokemonGrid');
    grid.innerHTML = '';

    var listToRender = filteredList;
    if (searchText !== '') {
        listToRender = listToRender.filter(function (pokemon) {
            return (
                pokemon.name.toLowerCase().includes(searchText.toLowerCase()) ||
                pokemon.id.toString().includes(searchText)
            );
        });
    }

    for (var index = 0; index < listToRender.length; index++) {
        var pokemon = listToRender[index];
        var container = document.createElement('div');
        container.className = 'col-md-3';

        var content = '<div class="c" onclick="showDetails(' + pokemon.id + ')">';
        content += '<img src="' + pokemon.sprites.front_default + '" class="i" alt="' + pokemon.name + '">';
        content += '<h5 class="text-center">#' + pokemon.id + ' ' +
            pokemon.name.charAt(0).toUpperCase() +
            pokemon.name.slice(1) +
            '</h5>';

        content += '<div class="text-center">';
        for (var j = 0; j < pokemon.types.length; j++) {
            var typeName = pokemon.types[j].type.name;
            content += '<span class="badge type-' + typeName + '">' + typeName + '</span> ';
        }
        content += '</div></div>';

        container.innerHTML = content;
        grid.appendChild(container);
    }
    
    document.getElementById('loading').style.display = 'none';
    document.getElementById('pokemonGrid').style.display = 'flex';

    if(selectedType !== '') {
        document.getElementById('pageInfo').textContent = 'Mostrando ' + listToRender.length + ' pokémons';
    } else {
        document.getElementById('pageInfo').textContent = 'Página ' + currentPage;
    }

    document.getElementById('prevBtn').disabled = currentPage === 1 || selectedType !== '';
    document.getElementById('nextBtn').disabled = selectedType !== '';
}

async function filterPokemon() {
    searchText = document.getElementById('s').value;
    selectedType = document.getElementById('typeFilter').value;

    if(selectedType !== '') {
        await loadByType();
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
