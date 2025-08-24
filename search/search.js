let map;
const center = [-6.893077469197533, -38.55906768770396];
const btn = document.querySelector('button');

const icone = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [35, 35],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
});

function inicializarMapa() {
  map = L.map('map').setView(center, 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);
}

function adicionarMarcador(lat, lng, texto = '') {
  L.marker(center, { icon: icone }).addTo(map).bindPopup(texto);
}

window.onload = () => {
  inicializarMapa();

  btn.addEventListener('click', async () => {
    const termo = document.getElementById('busca').value.trim();
    const resultadosDiv = document.getElementById('resultados');
    resultadosDiv.innerHTML = '';

    if (!termo) return alert('Digite algo para buscar.');

    try {
      const res = await fetch(`http://localhost:3000/Eventos/search/${termo}`);
      if (!res.ok) {
        resultadosDiv.innerHTML = `<p>Nenhum evento encontrado.</p>`;
        return;
      }

      const eventos = await res.json();

      eventos.forEach((evento, index) => {
        const div = document.createElement('div');
        div.className = 'evento';
    
        div.innerHTML = `
        <h3>${evento.nome}</h3>
        <p><strong>Descrição:</strong> ${evento.descricao || 'Sem descrição'}</p>
        <p><strong>Data:</strong> ${new Date(evento.data).toLocaleDateString('pt-BR')}</p>
        `;

        resultadosDiv.appendChild(div);

        const [lng, lat] = evento.local.coordinates;
        adicionarMarcador(lat, lng, evento.nome);

        //Centraliza no primeiro resultado
        if (index === 0) {
          map.setView(center, 16);
        }
      });

    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
      resultadosDiv.innerHTML = `<p>Erro ao buscar eventos.</p>`;
    }
  });
};