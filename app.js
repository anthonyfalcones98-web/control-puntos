

// CONFIGURACIÓN
const repoOwner = "Antho98";
const repoName = "control-puntos";
const filePath = "data.json";
const token = "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";

let data;
let selectedUser = null;
let isAdmin = false;

// Cargar datos de GitHub
async function fetchData() {
  const response = await fetch(
    `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`,
    { headers: { Authorization: `token ${token}` } }
  );
  const result = await response.json();
  const content = atob(result.content);
  data = JSON.parse(content);
}

// BUSCADOR CON SUGERENCIAS
function showSuggestions(query) {
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

// SELECCIONAR USUARIO
function selectUser(user) {
  selectedUser = user;
  document.getElementById("result").innerText =
    `${user.name} tiene ${user.points} puntos`;

  // Mostrar panel admin solo si está loggeado como admin
  if (isAdmin) {
    document.getElementById("adminPanel").style.display = "block";
  }
}

// LOGIN ADMIN
function login() {
  const user = document.getElementById("adminUser").value;
  const pass = document.getElementById("adminPass").value;

  if (user === data.admin.username && pass === data.admin.password) {
    isAdmin = true;
    document.getElementById("errorMsg").innerText = "";
    alert("Administrador logueado correctamente");

    // Mostrar panel admin si ya hay usuario seleccionado
    if (selectedUser) {
      document.getElementById("adminPanel").style.display = "block";
    }
  } else {
    document.getElementById("errorMsg").innerText =
      "PENDEJO, ESCRIBE BIEN QUE ESE USUARIO O CONTRASEÑA NO EXISTE.";
  }
}

// LOGOUT ADMIN
function logout() {
  isAdmin = false;
  document.getElementById("adminPanel").style.display = "none";
  document.getElementById("adminUser").value = "";
  document.getElementById("adminPass").value = "";
  alert("Sesión cerrada");
}

// FUNCIONES ADMIN PARA MODIFICAR PUNTOS
async function addPoint() {
  if (!selectedUser) return;
  selectedUser.points += 1;
  await saveData();
  selectUser(selectedUser);
}

async function removePoint() {
  if (!selectedUser) return;
  selectedUser.points -= 1;
  await saveData();
  selectUser(selectedUser);
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
        message: "Actualizar puntos",
        content: btoa(JSON.stringify(data, null, 2)),
        sha: file.sha
      })
    }
  );
}

// EVENTO BUSCADOR
document.getElementById("search").addEventListener("input", e => {
  showSuggestions(e.target.value);
});

// CARGAR DATOS INICIALMENTE
fetchData();
