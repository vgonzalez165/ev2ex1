checkLogged();

// ***********************************************************************
// Comportamiento de la página de inicio
// ***********************************************************************

const inputUser = document.getElementById('user');
const inputPass = document.getElementById('pass');
// const txtError = document.getElementById('error-msg');

function checkError(e) {
    if (!e.target.value) {
        e.target.classList.add('error');
        e.target.placeholder = 'Campo obligatorio'
    } else {
        e.target.classList.remove('error')
        e.target.placeholder = '';
    }
}

inputUser.addEventListener( 'blur', e => checkError(e));
inputUser.addEventListener( 'focus', e => {
    e.target.classList.remove('error');
    e.target.placeholder = '';
});

inputPass.addEventListener( 'blur', e => checkError(e));
inputPass.addEventListener( 'focus', e => {
    e.target.classList.remove('error');
    e.target.placeholder = '';
});



// ***********************************************************************
// Botón de REGISTRO
// ***********************************************************************
document.getElementById('btn-reg').addEventListener( 'click', e => {
    e.preventDefault();
    fetch('http://localhost:5000/api/user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: inputUser.value,
            pass: inputPass.value
        })
    })
    .then( response => {
        if (response.ok) {
            alert(`El usuario ${inputUser.value} se ha registrado correctamente.`);
        } else {
            alert(`Se ha producido un error al registrar el usuario`);
        }
    })
})

// ***********************************************************************
// Botón de LOGIN
// ***********************************************************************
document.getElementById('btn-login').addEventListener('click', e => {
    e.preventDefault();
    fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: inputUser.value,
            pass: inputPass.value
        })
    })
    .then( response => {
        if (response.ok) {
            return response.json();
        } else {
            console.log(error);
        }
    })
    .then( data => {
        localStorage.setItem('id', data.id);
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        checkLogged();
    })
})

// ***********************************************************************
// Botón de LOGOUT
// ***********************************************************************
document.getElementById('logout').addEventListener('click', e => {
    localStorage.removeItem('token');
    localStorage.removeItem('id');
    checkLogged();
})

function checkLogged() {
    if (localStorage.getItem('token')) {
        document.getElementById('logged').classList.remove('hidden');
        document.getElementById('main-page').classList.remove('hidden');
        document.getElementById('modal').classList.add('hidden');
    } else {
        document.getElementById('logged').classList.add('hidden');
        document.getElementById('main-page').classList.add('hidden');
        document.getElementById('modal').classList.remove('hidden');
    }
}




// ********************************************************
// PÁGINA PRINCIPAL
// ********************************************************

let groups=[];

function renderResults() {
    let divResults = document.getElementById('results');
    divResults.textContent = '';
    groups
        .filter( (item) => {
            if (document.getElementById('category-all').classList.contains('selected')) {
                return true;
            } else {
                let filterRap = document.getElementById('category-rap').classList.contains('selected');
                let filterRock = document.getElementById('category-rock').classList.contains('selected');
                return ((item.category == 'Rap' && filterRap) || (item.category == 'Rock' && filterRock));
            }
        } ) 
        .forEach( ({img, group, concerts} ) => {
            let div = document.createElement('div');
            div.classList.add('group');
            div.addEventListener('click', e => {
                renderMap(group, concerts);
            })
            div.innerHTML = `
                    <div class="purchase">+</div>
                    <div class="image"">
                    <img src="assets/${img}" alt="${group}">
                    </div>
                    <div class="name">${group}</div>`
            divResults.append(div);
        })
}


// Botón de búsqueda
let btnSearch = document.getElementById('btn-search');
btnSearch.addEventListener( 'click', e => {
    let inputSearch = document.getElementById('input-search');
        fetch(`http://localhost:5000/api/group/?username=${localStorage.getItem('username')}${ inputSearch.value ? '&name='+inputSearch.value : ''}`, {
            method: 'GET',
            headers: {
                Authorization: localStorage.getItem('token')
            }
        })
        .then( response => {
            if (!response.ok) {
                alert('Ha habido un error al realizar la solicitud.');
            } else {
                return response.json();
            }
        })
        .then( data => {
            groups = data;
            renderResults();
        })
})


// Botones de filtro
let btnAll = document.getElementById('category-all');
let btnRap = document.getElementById('category-rap');
let btnRock = document.getElementById('category-rock');
document.getElementById('category-rap').addEventListener('click', e => {
    btnAll.classList.remove('selected');
    btnRap.classList.add('selected');
    btnRock.classList.remove('selected');
    renderResults();
});
document.getElementById('category-rock').addEventListener('click', e => {
    btnAll.classList.remove('selected');
    btnRap.classList.remove('selected');
    btnRock.classList.add('selected');
    renderResults();
});
document.getElementById('category-all').addEventListener('click', e => {
    btnAll.classList.add('selected');
    btnRap.classList.remove('selected');
    btnRock.classList.remove('selected');
    renderResults();
});


let divMap = document.createElement('div');
divMap.id = 'map';
document.getElementById('map-section').append(divMap);
let map = L.map('map');
map.setView([42.5, -6.0], 13);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
let markers = [];


// ********************************************************
// PÁGINA DEL MAPA
// ********************************************************

function renderMap(group, concerts) {

    markers.forEach( marker => marker.remove());

    let lats = concerts.map( item => item.lat );
    let lons = concerts.map( item => item.lon );

    let medLat = ( Math.max(...lats) + Math.min(...lats) ) / 2;
    let medLon = ( Math.max(...lons) + Math.min(...lons) ) / 2;

    map.setView([ medLat, medLon ], 9);
    
    concerts.forEach( item => {
        let date = new Date(item.date)
        let months = 'Enero Febrero Marzo Abril Mayo Junio Julio Agosto Septiembre Octubre Noviembre Diciembre'.split(' ');
        let html = `<h3>${item.place}</h3>
                    <p>${date.getDate() + ' de ' + months[date.getMonth()] + ' de ' + date.getFullYear()}</p>
                    <a href="#" data-group-name="${group}" data-id="${item.id}">Comprar entradas</a>
                    `;
        markers.push(
            L.marker([item.lat, item.lon])
                .addTo(map)
                .bindPopup(html)
                .openPopup()
        );
        let links = document.querySelectorAll('a[data-id]');
        links.forEach( item => {
            item.addEventListener( 'click', e => {
                e.preventDefault();
                console.log("XXXXXXXXX")
                purchaseTicket(e.target.dataset["group-name"], e.target.dataset.id);
                
            })
        } )
    } )
}


function purchaseTicket(group, id) {
    console.log(group);
    console.log(id)
}