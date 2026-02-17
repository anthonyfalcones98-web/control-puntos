
// ------------- CONFIGURACIÓN ----------------
const repoOwner = "anthonyfalcones98-web";
const repoName = "control-puntos";
const filePath = "data.json";
const token = "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";

const ADMIN_USER = "Antho98";
const ADMIN_PASS = "1234";

let users = [];
let selectedUser = null;
let isAdmin = false;
let fileSHA = null;

// Cargar usuarios desde GitHub
async function loadUsers() {
  const response = await fetch(
    `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`,
    {
      headers: {
        Authorization: `token ${token}`
      }
    }
  );

  const data = await response.json();
  fileSHA = data.sha;

  const content = atob(data.content);
  users = JSON.parse(content);

  displayUsers();
}

// Mostrar usuarios en tiempo real
function displayUsers() {
  const suggestions = document.getElementById("suggestions");
  suggestions.innerHTML = "";

  users.forEach(u => {
    const div = document.createElement("div");
    div.innerText = u.name + " - " + u.points + " puntos";
    div.onclick = () => selectUser(u, div);
    suggestions.appendChild(div);
  });
}

// Guardar usuarios en GitHub
async function saveUsers() {
  const updatedContent = btoa(JSON.stringify(users, null, 2));

  await fetch(
    `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`,
    {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "Actualización automática de puntos",
        content: updatedContent,
        sha: fileSHA
      })
    }
  );

  await loadUsers();
}

// LOGIN
function toggleLogin() {
  document.getElementById("loginPanel").classList.toggle("hidden");
}

function login() {
  const user = document.getElementById("adminUser").value;
  const pass = document.getElementById("adminPass").value;
  const msg = document.getElementById("loginMessage");

  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    isAdmin = true;
    msg.innerHTML = "Admin loggeado correctamente";
    document.getElementById("adminPanel").classList.remove("hidden");
    document.getElementById("loginPanel").classList.add("hidden");
  } else {
    msg.innerHTML = "<span style='color:red;font-size:16px;'>Estas pendejo/a?, el usuario o contraseña ingresados no existen.</span>";
  }
}

function logout() {
  isAdmin = false;
  document.getElementById("adminPanel").classList.add("hidden");
}

// BÚSQUEDA
function searchUser() {
  const input = document.getElementById("searchInput").value.toLowerCase();
  const suggestions = document.getElementById("suggestions");
  suggestions.innerHTML = "";

  users
    .filter(u => u.name.toLowerCase().includes(input))
    .forEach(u => {
      const div = document.createElement("div");
      div.innerText = u.name + " - " + u.points + " puntos";
      div.onclick = () => selectUser(u, div);
      suggestions.appendChild(div);
    });
}

// Selección de usuario
function selectUser(user, element) {
  selectedUser = user;
  document.querySelectorAll("#suggestions div").forEach(d => d.classList.remove("selected"));
  element.classList.add("selected");

  document.getElementById("selectedName").innerText = user.name;
  document.getElementById("selectedPoints").innerText = user.points;
  document.getElementById("resultBox").classList.remove("hidden");
}

// ACCIONES ADMIN
async function addPoint() {
  if (!isAdmin || !selectedUser) return;
  selectedUser.points++;
  document.getElementById("selectedPoints").innerText = selectedUser.points;
  await saveUsers();
}

async function removePoint() {
  if (!isAdmin || !selectedUser) return;
  selectedUser.points--;
  document.getElementById("selectedPoints").innerText = selectedUser.points;
  await saveUsers();
}

async function addUser() {
  if (!isAdmin) return;
  const name = prompt("Nuevo nombre:");
  if (!name) return;
  users.push({ name: name, points: 0 });
  await saveUsers();
  alert("Usuario agregado");
}

async function deleteUser() {
  if (!isAdmin || !selectedUser) return;

  if (confirm("¿Seguro que quieres eliminar este nombre?")) {
    users = users.filter(u => u !== selectedUser);
    selectedUser = null;
    document.getElementById("resultBox").classList.add("hidden");
    await saveUsers();
    alert("Usuario eliminado");
  }
}

// Cargar usuarios al iniciar
loadUsers();

