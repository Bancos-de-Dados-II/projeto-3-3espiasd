const nome = document.getElementById('nome');
const descricao = document.getElementById('descricao');
const data = document.getElementById('data');
const localEvento = document.getElementById('local');
const botaoVerEventos = document.getElementById('botaoVerEventos');
const mostrarEventos = document.getElementById('mostrarEventos');
const botaoSalvar = document.getElementById('botaoSalvar');
const botaoBuscar = document.getElementById('botaoBuscar');
const marcadoresEventos = [];
let idEventoAtual = null;

const center = [-6.893077469197533, -38.55906768770396];
const map = L.map('map').setView(center, 13);

const icone = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [35, 35],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
});

const marker = L.marker(center, { icon: icone });

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
}).addTo(map);

map.on('click', (evt) => {
    marker.setLatLng(evt.latlng);
    map.setView(evt.latlng);
    marker.addTo(map);
});

map.locate();

map.on('locationfound', (evt) => {
    marker.setLatLng(evt.latlng);
    map.setView(evt.latlng);
});

function limparFormulario() {
    nome.value = "";
    descricao.value = "";
    data.value = "";
    localEvento.value = "";
}

function voltarModoCriarEvento() {
    botaoSalvar.textContent = "Salvar evento";
    idEventoAtual = null;
}

function aposSalvarOuAtualizarOuApagar() {
    limparFormulario();
    carregarEventosNoMapa();
    botaoVerEventos.click();
    voltarModoCriarEvento();
}

botaoBuscar.addEventListener('click', () => {
    const local = localEvento.value;
    fetch(`https://nominatim.openstreetmap.org/search?q=${local}&format=jsonv2`)
        .then(result => result.json())
        .then(locais => {
            if (locais && locais.length > 0) {
                const ponto = [locais[0].lat, locais[0].lon];
                map.setView(ponto);
                marker.setLatLng(ponto);
            } else {
                alert("Local não encontrado.");
            }
        })
        .catch(() => alert("Erro ao buscar o local."));
});

function obterDadosEvento() {
    return {
        nome: nome.value,
        descricao: descricao.value,
        data: data.value,
        local: {
            type: "Point",
            coordinates: [marker.getLatLng().lng, marker.getLatLng().lat]
        }
    };
}

async function salvarEvento() {
    const evento = obterDadosEvento();
    try {
        const response = await fetch('http://localhost:3000/Eventos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(evento)
        });

        if (!response.ok) throw new Error("Erro ao salvar evento");

        await response.json();
        alert("Evento salvo!");
        aposSalvarOuAtualizarOuApagar();
    } catch (err) {
        console.error("Erro ao salvar evento:", err);
        alert("Erro ao salvar evento!");
    }
}

async function atualizarEvento(id) {
    const evento = obterDadosEvento();
    try {
        const response = await fetch(`http://localhost:3000/Eventos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(evento)
        });

        if (!response.ok) throw new Error("Erro ao atualizar evento");

        await response.json();
        alert("Evento atualizado!");
        aposSalvarOuAtualizarOuApagar();
    } catch (err) {
        console.error("Erro ao atualizar evento:", err);
        alert("Erro ao atualizar evento!");
    }
};

async function apagarEvento(id) {
    try {
        const response = await fetch(`http://localhost:3000/Eventos/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error("Erro ao apagar");

        alert("Evento apagado com sucesso!");

        aposSalvarOuAtualizarOuApagar();
    } catch (error) {
        console.error("Erro ao apagar evento:", error);
        alert("Erro ao apagar o evento!");
    }
}


async function carregarEventosNoMapa() {
    try {
        const response = await fetch('http://localhost:3000/Eventos');
        const eventos = await response.json();
        marcadoresEventos.forEach(m => map.removeLayer(m));
        marcadoresEventos.length = 0;

        const bounds = [];

        eventos.forEach(evento => {
            const [lng, lat] = evento.local.coordinates;
            const latlng = [lat, lng];
            bounds.push(latlng);

            const marcador = L.marker(latlng, { icon: icone })
                .addTo(map)
                .bindPopup(`<strong>${evento.nome}</strong><br>${evento.descricao}`);
            marcadoresEventos.push(marcador);
        });

        if (bounds.length > 0) {
            map.fitBounds(bounds);
        }
    } catch (error) {
        console.error("Erro ao carregar eventos no mapa:", error);
    }
}
carregarEventosNoMapa();


async function reverseGeoCode(lat, lng) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
        const data = await response.json();
        return data.display_name || "Local desconhecido";
    } catch (error) {
        console.error("Erro ao reverter geocodificação:", error);
        return "Erro ao obter local";
    }
}

async function verEventos() {
    try {
        const response = await fetch('http://localhost:3000/Eventos');
        const eventos = await response.json();
        return eventos;
    } catch (error) {
        console.error("Erro ao buscar eventos:", error);
        return [];
    }
};

function preencherFormulario(evento) {
    console.log(evento)
    const [lng, lat] = evento.local.coordinates;

    nome.value = evento.nome;
    descricao.value = evento.descricao;
    data.value = evento.data;
    localEvento.value = "";

    marker.setLatLng([lat, lng]);
    map.setView([lat, lng]);
    marker.addTo(map);

    botaoSalvar.textContent = "Atualizar evento";
    idEventoAtual = evento._id;
    console.log("Entrou no modo de atualização com idEventoAtual =", idEventoAtual);
};

botaoSalvar.addEventListener('click', () => {
    console.log("Botão salvar clicado, idEventoAtual =", idEventoAtual);
    if (idEventoAtual) {
        atualizarEvento(idEventoAtual);
    } else {
        salvarEvento();
    }
});

botaoVerEventos.addEventListener('click', async () => {
    const eventos = await verEventos();
    mostrarEventos.innerHTML = '';
    if (!eventos || eventos.length === 0) {
        mostrarEventos.textContent = 'Nenhum evento cadastrado ainda.';
        return;
    }

    for (const evento of eventos) {
        const li = document.createElement('li');
        const [lng, lat] = evento.local.coordinates;
        const local = await reverseGeoCode(lat, lng);

        li.innerHTML = `<strong>Nome:</strong> ${evento.nome}<br>
            <strong>Descrição:</strong> ${evento.descricao}<br>
            <strong>Data:</strong> ${new Date(evento.data).toLocaleDateString('pt-BR')}<br>
            <strong>Local:</strong> ${local}<br><br>`;

        const botaoAtualizar = document.createElement('button');
        botaoAtualizar.textContent = 'Atualizar evento';
        botaoAtualizar.onclick = () => preencherFormulario(evento);

        const botaoApagar = document.createElement('button');
        botaoApagar.textContent = 'Apagar evento';
        botaoApagar.onclick = () => apagarEvento(evento._id);

        li.appendChild(botaoAtualizar);
        li.appendChild(botaoApagar);
        mostrarEventos.appendChild(li);
    }
});

