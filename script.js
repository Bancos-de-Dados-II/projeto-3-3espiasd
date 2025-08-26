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

// Buscar idosos
async function verIdosos() {
    try {
        const res = await fetch("http://localhost:3000/idosos");
        if (!res.ok) throw new Error("Erro ao buscar idosos");
        return await res.json();
    } catch (err) {
        console.error(err);
        return [];
    }
}

// Criar select de idosos
function criarSelectIdosos(eventoId, idosos) {
    const select = document.createElement('select');
    select.id = `select-${eventoId}`;

    const optionInicial = document.createElement('option');
    optionInicial.value = "";
    optionInicial.textContent = "Selecione um idoso";
    select.appendChild(optionInicial);

    idosos.forEach(i => {
        const opt = document.createElement('option');
        opt.value = i._id;
        opt.textContent = i.nome;
        select.appendChild(opt);
    });

    return select;
}

// Criar botão de adicionar idoso
function criarBotaoAdicionarIdoso(evento, select, participantesSpan) {
    const btn = document.createElement('button');
    btn.textContent = "Adicionar idoso";

    btn.onclick = async () => {
        const idosoId = select.value;
        if (!idosoId) return alert("Selecione um idoso!");

        try {
            const res = await fetch(`http://localhost:3000/participacao/${idosoId}/participa/${evento._id}`, {
                method: "POST"
            });
            if (!res.ok) throw new Error("Erro ao adicionar idoso");

            // Atualiza o frontend com o nome do idoso
            const idosoNome = select.options[select.selectedIndex].text;
            if (participantesSpan.textContent === "Nenhum participante ainda") {
                participantesSpan.textContent = idosoNome;
            } else {
                participantesSpan.innerHTML += "<br> " + idosoNome;
            }

            alert(`Idoso adicionado ao evento "${evento.nome}" com sucesso!`);
        } catch (err) {
            alert(err.message);
        }
    };

    return btn;
}

// Mostrar eventos com botão de adicionar idoso
botaoVerEventos.addEventListener('click', async () => {
    const eventos = await verEventos();
    const idosos = await verIdosos();
    mostrarEventos.innerHTML = '';

    if (!eventos || eventos.length === 0) {
        mostrarEventos.textContent = 'Nenhum evento cadastrado ainda.';
        return;
    }

    for (const evento of eventos) {
        const li = document.createElement('li');

        // Informações do evento
        const [lng, lat] = evento.local.coordinates;
        const local = await reverseGeoCode(lat, lng);
        li.innerHTML = `
            <strong>Nome:</strong> ${evento.nome}<br>
            <strong>Descrição:</strong> ${evento.descricao}<br>
            <strong>Data:</strong> ${new Date(evento.data).toLocaleDateString('pt-BR')}<br>
            <strong>Local:</strong> ${local}<br><br>
        `;

        // Botões atualizar e apagar
        const botaoAtualizar = document.createElement('button');
        botaoAtualizar.textContent = 'Atualizar evento';
        botaoAtualizar.onclick = () => preencherFormulario(evento);

        const botaoApagar = document.createElement('button');
        botaoApagar.textContent = 'Apagar evento';
        botaoApagar.onclick = () => apagarEvento(evento._id);

        li.appendChild(botaoAtualizar);
        li.appendChild(botaoApagar);
        li.appendChild(document.createElement('br'));

        // Lista de participantes
        const participantesSpan = document.createElement('span');
        participantesSpan.className = 'participantes';
        participantesSpan.innerHTML = evento.participantes
            ? evento.participantes.map(p => p.nome).join('<br> ')
            : "Nenhum participante ainda";
        li.appendChild(participantesSpan);
        li.appendChild(document.createElement('br'));

        // Select de idosos
        const selectIdosos = criarSelectIdosos(evento._id, idosos);
        li.appendChild(selectIdosos);

        // Botão adicionar idoso
        const botaoAddIdoso = criarBotaoAdicionarIdoso(evento, selectIdosos, participantesSpan);
        li.appendChild(botaoAddIdoso);

        mostrarEventos.appendChild(li);
    }
});
