var a = [];
var b = [];
var c = 1;
var d = 20;
var e = '';
var f1 = '';
var g = null;

const API = 'https://pokeapi.co/api/v2/pokemon';
const API2 = 'https://pokeapi.co/api/v2/type';

async function i() {
    document.getElementById('loading').innerHTML = '';
    for(var i = 0; i < 20; i++) {
        document.getElementById('loading').innerHTML += '<div class="col-md-3"><div class="skeleton"></div></div>';
    }
    
    try {
        var r = await fetch(API2);
        var dt = await r.json();
        var sel = document.getElementById('typeFilter');
        for(var i = 0; i < dt.results.length; i++) {
            var opt = document.createElement('option');
            opt.value = dt.results[i].name;
            opt.textContent = dt.results[i].name.charAt(0).toUpperCase() + dt.results[i].name.slice(1);
            sel.appendChild(opt);
        }
    } catch(err) {
        console.log('erro');
    }
    
    l();
}

async function l() {
    document.getElementById('loading').style.display = 'flex';
    document.getElementById('pokemonGrid').style.display = 'none';
    
    try {
        var off = (c - 1) * d;
        var ur = API + '?limit=' + d + '&offset=' + off;
        var r = await fetch(ur);
        var dt = await r.json();
        
        var pro = [];
        for(var i = 0; i < dt.results.length; i++) {
            pro.push(fetch(dt.results[i].url));
        }
        
        var r = await Promise.all(pro);
        a = [];
        for(var i = 0; i < r.length; i++) {
            var pokemon = await r[i].json();
            a.push(pokemon);
        }
        
        b = [...a];
        UNIFOR();
    } catch(error) {
        console.log('erro ao carregar');
        alert('Erro ao carregar Pokémons!');
    }
}

async function lbt() {
    document.getElementById('loading').style.display = 'flex';
    document.getElementById('pokemonGrid').style.display = 'none';

    try {
        var ur = API2 + '/' + f1;
        var r = await fetch(ur);
        var dt = await r.json();

        var pr = [];
        var li = dt.pokemon.length > 100 ? 100 : dt.pokemon.length; // Limita a 100
        for(var i = 0; i < li; i++) {
            pr.push(fetch(dt.pokemon[i].pokemon.url));
        }

        var rps = await Promise.all(pr);
        a = [];
        for(var i = 0; i < rps.length; i++) {
            var p = await rps[i].json();
            a.push(p);
        }

        b = [...a];
        UNIFOR();
    } catch(error) {
        console.log('erro ao carregar tipo');
        alert('Erro ao carregar Pokémons do tipo!');
    }
}

function UNIFOR() {
    var g = document.getElementById('pokemonGrid');
    g.innerHTML = '';

    var fil = b;
    if(e !== '') {
        fil = fil.filter(p => {
            return p.name.toLowerCase().includes(e.toLowerCase()) ||
                   p.id.toString().includes(e);
        });
    }

    for(var i = 0; i < fil.length; i++) {
        var p = fil[i];
        var fdp = document.createElement('div');
        fdp.className = 'col-md-3';
        
        var html = '<div class="c" onclick="showDetails(' + p.id + ')">';
        html = html + '<img src="' + p.sprites.front_default + '" class="i" alt="' + p.name + '">';
        html = html + '<h5 class="text-center">#' + p.id + ' ' + p.name.charAt(0).toUpperCase() + p.name.slice(1) + '</h5>';
        html = html + '<div class="text-center">';
        
        for(var j = 0; j < p.types.length; j++) {
            var typeName = p.types[j].type.name;
            html = html + '<span class="badge type-' + typeName + '">' + typeName + '</span> ';
        }
        
        html = html + '</div></div>';
        fdp.innerHTML = html;
        g.appendChild(fdp);
    }
    
    document.getElementById('loading').style.display = 'none';
    document.getElementById('pokemonGrid').style.display = 'flex';

    if(f1 !== '') {
        document.getElementById('pageInfo').textContent = 'Mostrando ' + fil.length + ' pokémons';
    } else {
        document.getElementById('pageInfo').textContent = 'Página ' + c;
    }

    document.getElementById('prevBtn').disabled = c === 1 || f1 !== '';
    document.getElementById('nextBtn').disabled = f1 !== '';
}

async function f() {
    e = document.getElementById('s').value;
    f1 = document.getElementById('typeFilter').value;

    // Se tem filtro de tipo, busca pokémons daquele tipo
    if(f1 !== '') {
        await lbt();
    } else {
        UNIFOR();
    }
}

function r() {
    document.getElementById('s').value = '';
    document.getElementById('typeFilter').value = '';
    e = '';
    f1 = '';
    c = 1;
    l();
}

function p1() {
    if(c > 1) {
        c--;
        if(f1 !== '') {
            UNIFOR();
        } else {
            l();
        }
    }
}

function p2() {
    c++;
    if(f1 !== '') {
        UNIFOR();
    } else {
        l();
    }
}

function x() {
    document.body.classList.toggle('dark');
}

async function Minhe_nha(id) {
    try {
        var xpto = await fetch(API + '/' + id);
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
    i();
};
