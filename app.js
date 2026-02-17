
// ---------- CONFIGURACIÓN ----------
const repoOwner = "anthonyfalcones98-web";
const repoName = "control-puntos";
const filePath = "data.json";
const token = "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"; // Pon aquí tu token de GitHub

const adminUser = "Antho98";
const adminPass = "1234";

let data;
let selectedUser = null;
let isAdmin = false;

// ------------- CARGAR DATOS ----------------
async function fetchData() {
  try {
    const res = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`,
      { headers: { Authorization: `token ${token}` } });
    const json = await res.json();
    data = JSON.parse(atob(json.content));
    renderTable();
  } catch(e) {
    console.error("Error cargando datos:", e);
  }
}

// ------------- RENDER TABLA ----------------
function renderTable(query="") {
  const tbody = document.querySelector("#usersTable tbody");
  tbody.innerHTML = "";
  data.users
    .filter(u => u.name.toLowerCase().includes(query.toLowerCase()))
    .forEach(user => {
      const tr = document.createElement("tr");
      tr.classList.toggle("selected", selectedUser && selectedUser.name === user.name);

      const nameTd = document.createElement("td");
      nameTd.textContent = user.name;
      tr.appendChild(nameTd);

      const pointsTd = document.createElement("td");
      pointsTd.textContent = user.points;
      tr.appendChild(pointsTd);

      const actionsTd = document.createElement("td");
      if(isAdmin) {
        const addBtn = document.createElement("button");
        addBtn.textContent = "➕";
        addBtn.onclick = () => { selectedUser=user; addPoint(); };
        actionsTd.appendChild(addBtn);

        const subBtn = document.createElement("button");
        subBtn.textContent = "➖";
        subBtn.onclick = () => { selectedUser=user; removePoint(); };
        actionsTd.appendChild(subBtn);

        const delBtn = document.createElement("button");
        delBtn.textContent = "🗑️";
        delBtn.onclick = () => { selectedUser=user; removeUser(); };
        actionsTd.appendChild(delBtn);
      }
      tr.appendChild(actionsTd);

      tbody.appendChild(tr);
    });
}

// ------------- BUSCADOR ----------------
document.getElementById("search").addEventListener("input", e => {
  renderTable(e.target.value);
});

// ------------- LOGIN ----------------
function login() {
  const userInput = document.getElementById("adminUser").value.trim();
  const passInput = document.getElementById("adminPass").value.trim();

  if(userInput === adminUser && passInput === adminPass){
    isAdmin = true;
    document.getElementById("errorMsg").innerText = "";
    alert("Administrador logueado correctamente");
    document.getElementById("adminPanel").style.display = "block";
    renderTable();
  } else {
    isAdmin = false;
    document.getElementById("errorMsg").innerText = "PENDEJO, ESCRIBE BIEN QUE ESE USUARIO O CONTRASEÑA NO EXISTE.";
    renderTable();
  }
}

function logout() {
  isAdmin = false;
  selectedUser = null;
  document.getElementById("adminPanel").style.display = "none";
  document.getElementById("adminUser").value = "";
  document.getElementById("adminPass").value = "";
  renderTable();
}

// ------------- PUNTOS ----------------
async function addPoint() {
  if(!selectedUser || !isAdmin) return;
  selectedUser.points += 1;
  await saveData();
  renderTable();
}

async function removePoint() {
  if(!selectedUser || !isAdmin) return;
  selectedUser.points -= 1;
  await saveData();
  renderTable();
}

// ------------- USUARIOS ----------------
function addUserPrompt() {
  if(!isAdmin) return;
  const name = prompt("Ingrese el nombre del nuevo usuario:");
  if(!name) return;
  if(data.users.some(u => u.name.toLowerCase()===name.toLowerCase())){
    alert("Este usuario ya existe.");
    return;
  }
  data.users.push({name: name.trim(), points:0});
  saveData();
  renderTable();
}

function removeUser() {
  if(!selectedUser || !isAdmin) return;
  if(!confirm(`¿Seguro quieres eliminar a ${selectedUser.name}?`)) return;
  data.users = data.users.filter(u=>u.name!==selectedUser.name);
  selectedUser=null;
  saveData();
  renderTable();
}

// ------------- GUARDAR EN GITHUB ----------------
async function saveData(){
  try{
    const getFile = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`,
      { headers: { Authorization: `token ${token}` }});
    const file = await getFile.json();

    await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`, {
      method:"PUT",
      headers:{ Authorization:`token ${token}`, "Content-Type":"application/json"},
      body: JSON.stringify({
        message: "Actualizar datos",
        content: btoa(JSON.stringify(data,null,2)),
        sha: file.sha
      })
    });
  } catch(e){ console.error("Error guardando datos:",e);}
}

// ------------- INICIAL ----------------
fetchData();



