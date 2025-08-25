const form = document.getElementById("form-idoso");
const lista = document.getElementById("lista-idosos");

// Função para criar um item da lista mostrando todos os campos
function criarItemIdoso(idoso) {
  const item = document.createElement("li");
  item.innerHTML = `
    <strong>Nome:</strong> ${idoso.nome} <br>
    <strong>CPF:</strong> ${idoso.cpf} <br>
    <strong>RG:</strong> ${idoso.rg || "-"} <br>
    <strong>SUS:</strong> ${idoso.sus || "-"} <br>
    <strong>Data de Nascimento:</strong> ${idoso.data_nascimento ? new Date(idoso.data_nascimento).toLocaleDateString() : "-"} <br>
    <strong>Sexo:</strong> ${idoso.sexo} <br>
    <strong>Nacionalidade:</strong> ${idoso.nacionalidade || "-"} <br>
    <strong>Naturalidade:</strong> ${idoso.naturalidade || "-"}
  `;
  return item;
}

// Adiciona novo idoso
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = {
    nome: document.getElementById("nome").value,
    cpf: document.getElementById("cpf").value,
    rg: document.getElementById("rg").value,
    sus: document.getElementById("sus").value,
    data_nascimento: document.getElementById("data_nascimento").value,
    sexo: document.getElementById("sexo").value,
    nacionalidade: document.getElementById("nacionalidade").value,
    naturalidade: document.getElementById("naturalidade").value
  };

  try {
    const response = await fetch("http://localhost:3000/idosos/cadastrarIdoso", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    if (!response.ok) throw new Error("Erro ao salvar idoso");

    const novoIdoso = await response.json();
    alert("Idoso salvo com sucesso!");

    // Adiciona na lista mostrando todos os campos
    lista.appendChild(criarItemIdoso(novoIdoso));
    form.reset();
  } catch (error) {
    alert("Erro: " + error.message);
  }
});

// Carrega todos os idosos já cadastrados ao abrir a página
async function carregarIdosos() {
  try {
    const res = await fetch("http://localhost:3000/idosos");
    if (!res.ok) throw new Error("Erro ao carregar idosos");

    const idosos = await res.json();
    lista.innerHTML = "";
    idosos.forEach(idoso => lista.appendChild(criarItemIdoso(idoso)));
  } catch (error) {
    console.error(error);
    lista.innerHTML = "<li>Erro ao carregar idosos.</li>";
  }
}

// Executa ao carregar a página
window.addEventListener("DOMContentLoaded", carregarIdosos);