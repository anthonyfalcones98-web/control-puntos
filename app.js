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
  try {
    const response = await fetch(
      `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`,
      { headers: { Authorization: `token ${token}` } }
    );
    const data = await response.json();
    fileSHA = data.sha;

    const content = atob(data.content);
    users = JSON.parse(content);

    displayUsers();
  } catch (error) {
    console.error("Error al cargar usuarios:", error);
  }
}

// Mostrar usuarios en tabla
function displayUsers() {
  const tbody = document.getElementById("usersBody");
  tbody.innerHTML = "";

  users.forEach(u => {
    const tr = document.createElement("tr");
    const tdName = document.createElement("td");
    const tdPoints = document.createElement("td");

    tdName.innerText = u.name;
    tdPoints.innerText = u.points;

    tr.onclick = () => selectUser(u, tr);

    tbody.appendChild(tr);
    tr.appendChild(tdName);
    tr.appendChild(tdPoints);
  });

  // Actualizar puntos si hay usuario seleccionado
  if (selectedUser) {
    const updatedUser = users.find(u => u.name === selectedUser.name);
    if (updatedUser) {
      selectedUser.points = updatedUser.points;
      document.getElementById("selectedPoints").innerText = selectedUser.points;
    }
  }
}

// Guardar usuarios en GitHub
async function saveUsers() {
  try {
    const updatedContent = btoa(JSON.stringify(users, null, 2));

    await fetch(
      `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`,
      {
        method: "PUT",
        headers: { Authorization: `token ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Actualización automática de puntos", content: updatedContent, sha: fileSHA })
      }
    );

    await loadUsers();
  } catch (error) {
    console.error("Error al guardar usuarios:", error);
  }
}

// LOGIN
function toggleLogin() { document.getElementById("loginPanel").classList.toggle("hidden"); }

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

// Selección de usuario
function selectUser(user, rowElement) {
  selectedUser = user;
  document.querySelectorAll("#usersBody tr").forEach(r => r.classList.remove("selected"));
  rowElement.classList.add("selected");

  document.getElementById("selectedName").innerText = user.name;
  document.getElementById("selectedPoints").innerText = user.points;
  document.getElementById("resultBox").classList.remove("hidden");
}

// ACCIONES ADMIN
async function addPoint() { if (!isAdmin || !selectedUser) return; selectedUser.points++; document.getElementById("selectedPoints").innerText = selectedUser.points; await saveUsers(); }
async function removePoint() { if (!isAdmin || !selectedUser) return; selectedUser.points--; document.getElementById("selectedPoints").innerText = selectedUser.points; await saveUsers(); }
async function addUser() { if (!isAdmin) return; const name = prompt("Nuevo nombre:"); if (!name) return; users.push({ name: name, points: 0 }); await saveUsers(); alert("Usuario agregado"); }
async function deleteUser() { if (!isAdmin || !selectedUser) return; if(confirm("¿Seguro que quieres eliminar este nombre?")) { users = users.filter(u => u!==selectedUser); selectedUser=null; document.getElementById("resultBox").classList.add("hidden"); await saveUsers(); alert("Usuario eliminado"); } }

// Clic en mi nombre para abrir Instagram correctamente
document.getElementById("myName").onclick = () => {
  window.open("https://www.instagram.com/anthonovsky27/", "_blank");
};

// Cargar usuarios al iniciar
loadUsers();

// 🔄 Auto-refresh cada 3 segundos
setInterval(loadUsers, 3000);
