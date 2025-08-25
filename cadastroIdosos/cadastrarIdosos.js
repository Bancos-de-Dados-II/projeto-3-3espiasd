const form = document.getElementById("form-idoso");
const lista = document.getElementById("lista-idosos");

// Campos do formulário
const campos = ["nome","cpf","rg","sus","data_nascimento","sexo","nacionalidade","naturalidade"];

// Função para criar item da lista
function criarItemIdoso(idoso) {
  const li = document.createElement("li");
  li.dataset.id = idoso._id;
  li.innerHTML = `
    ${campos.map(c => `<strong>${c}:</strong> ${idoso[c] || "-"}<br>`).join("")}
    <div class="acoes">
      <button class="btn-atualizar">Atualizar</button>
      <button class="btn-deletar">Deletar</button>
    </div>
  `;
  return li;
}

// Carregar todos os idosos
async function carregarIdosos() {
  try {
    const res = await fetch("http://localhost:3000/idosos");
    const idosos = await res.json();
    lista.innerHTML = "";
    idosos.forEach(idoso => lista.appendChild(criarItemIdoso(idoso)));
  } catch (err) {
    console.error(err);
    lista.innerHTML = "<li>Erro ao carregar idosos.</li>";
  }
}

// Delegação de eventos para atualizar/deletar
lista.addEventListener("click", async (e) => {
  const li = e.target.closest("li");
  if (!li) return;
  const id = li.dataset.id;

  // Deletar
  if (e.target.classList.contains("btn-deletar")) {
    if (!confirm("Deseja realmente deletar este idoso?")) return;
    try {
      await fetch(`http://localhost:3000/idosos/${id}`, { method: "DELETE" });
      li.remove();
      alert("Idoso deletado com sucesso!");
    } catch (err) {
      alert("Erro ao deletar idoso");
    }
  }

  // Atualizar
  if (e.target.classList.contains("btn-atualizar")) {
    const res = await fetch(`http://localhost:3000/idosos/${id}`);
    const idoso = await res.json();
    campos.forEach(c => form[c].value = idoso[c] || "");
    form.dataset.atualizando = id; // indica que estamos editando
    window.scrollTo({ top: 0, behavior: 'smooth' }); // rolar para o formulário
  }
});

// Enviar formulário
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = Object.fromEntries(campos.map(c => [c, form[c].value]));

  try {
    if (form.dataset.atualizando) {
      await fetch(`http://localhost:3000/idosos/${form.dataset.atualizando}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      delete form.dataset.atualizando;
      alert("Idoso atualizado com sucesso!");
    } else {
      const res = await fetch("http://localhost:3000/idosos/cadastrarIdoso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const novoIdoso = await res.json();
      lista.appendChild(criarItemIdoso(novoIdoso));
      alert("Idoso cadastrado com sucesso!");
    }
    form.reset();
    carregarIdosos();
  } catch (err) {
    alert("Erro ao salvar idoso");
  }
});

// Inicializa
window.addEventListener("DOMContentLoaded", carregarIdosos);