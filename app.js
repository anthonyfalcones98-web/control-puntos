// CONFIGURACIÓN
const repoOwner = "anthonyfalcones98-web"; // tu usuario GitHub
const repoName = "control-puntos"; 
const filePath = "data.json";
const token = "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"; // tu token GitHub

let data;
let selectedUser = null;
let isAdmin = false;

// Cargar datos desde GitHub
async function fetchData() {
  const response = await fetch(
    `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`,
    { headers: { Authorization: `token ${token}` } }
  );
  const result = await response.json();
  const content = atob(result.content);
  data = JSON.parse(content);
  renderResults();
  renderSuggestions(""); // refresca sugerencias
}

// Renderizar resultados y panel admin
function renderResults() {
  const resultDiv = document.getElementById("result");
  if (selectedUser) {
    resultDiv.innerText = `${selectedUser.name} tiene ${selectedUser.points} puntos`;
  } else {
    resultDiv.innerText = "";
  }
  document.getElementById("adminPanel").style.display =
    isAdmin && selectedUser ? "block" : isAdmin ? "block" : "none";

  // Resaltar el usuario seleccionado en la lista de sugerencias
  document.querySelectorAll("#suggestions li").forEach(li => {
    if (selectedUser && li.textContent === selectedUser.name) {
      li.classList.add("selected");
    } else {
      li.classList.remove("selected");
    }
  });
}

// BUSCADOR CON SUGERENCIAS
function renderSuggestions(query) {
  const list = document.getElementById("suggestions");
  list.innerHTML = "";
  const filtered = data.users.filter(u =>
    u.name.toLowerCase().includes(query.toLowerCase())
  );
  filtered.forEach(user => {
    const li = document.createElement("li");
    li.textContent = user.name;
    li.onclick = () => selectUser(user);
    list.appendChild(li);
  });
}

document.getElementById("search").addEventListener("input", e => {
  renderSuggestions(e.target.value);
});

// SELECCIONAR USUARIO
function selectUser(user) {
  selectedUser = user;
  renderResults();
}

// LOGIN ADMIN
function login() {
  const userInput = document.getElementById("adminUser").value.trim();
  const passInput = document.getElementById("adminPass").value.trim();

  if (userInput === data.admin.username && passInput === data.admin.password) {
    isAdmin = true;
    document.getElementById("errorMsg").innerText = "";
    alert("Administrador logueado correctamente");
    renderResults();
  } else {
    isAdmin = false;
    document.getElementById("errorMsg").innerText =
      "PENDEJ@, ESCRIBE BIEN QUE ESE USUARIO O CONTRASEÑA NO EXISTE.";
    renderResults();
  }
}

// LOGOUT ADMIN
function logout() {
  isAdmin = false;
  selectedUser = null;
  document.getElementById("adminPanel").style.display = "none";
  document.getElementById("adminUser").value = "";
  document.getElementById("adminPass").value = "";
  renderSuggestions("");
  alert("Sesión cerrada");
}

// FUNCIONES ADMIN PARA MODIFICAR PUNTOS
async function addPoint() {
  if (!selectedUser || !isAdmin) return;
  selectedUser.points += 1;
  await saveData();
  renderResults();
}

async function removePoint() {
  if (!selectedUser || !isAdmin) return;
  selectedUser.points -= 1;
  await saveData();
  renderResults();
}

// AGREGAR NUEVO USUARIO
function addUserPrompt() {
  if (!isAdmin) return;
  const name = prompt("Ingrese el nombre del nuevo Ciudadano:");
  if (!name) return;
  const exists = data.users.some(u => u.name.toLowerCase() === name.toLowerCase());
  if (exists) {
    alert("Este usuario ya existe.");
    return;
  }
  const newUser = { name: name.trim(), points: 0 };
  data.users.push(newUser);
  saveData();
  renderSuggestions("");
}

// ELIMINAR USUARIO
function removeUser() {
  if (!selectedUser || !isAdmin) return;
  const confirmDel = confirm(`¿Seguro quieres eliminar a ${selectedUser.name}?`);
  if (!confirmDel) return;

  data.users = data.users.filter(u => u.name !== selectedUser.name);
  selectedUser = null;
  saveData();
  renderSuggestions("");
  renderResults();
}

// GUARDAR DATOS EN GITHUB
async function saveData() {
  const getFile = await fetch(
    `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`,
    { headers: { Authorization: `token ${token}` } }
  );
  const file = await getFile.json();
  await fetch(
    `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`,
    {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "Actualizar datos",
        content: btoa(JSON.stringify(data, null, 2)),
        sha: file.sha
      })
    }
  );
}

// CARGA INICIAL
fetchData();
