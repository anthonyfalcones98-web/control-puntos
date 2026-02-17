
// ------------- CONFIGURACIÓN ----------------
const repoOwner = "anthonyfalcones98-web";       // Cambia por tu usuario de GitHub
const repoName = "control-puntos";    // Tu repo
const filePath = "data.json";
const token = "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";    // token GitHub

const adminUser = "Antho98";
const adminPass = "1234";

let data;
let selectedUser = null;
let isAdmin = false;

// Toggle login
function toggleLogin(){
  const box = document.getElementById("loginBox");
  box.style.display = box.style.display === "block" ? "none" : "block";
}

// Cargar datos
async function fetchData(){
  const res = await fetch(
    `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`,
    { headers:{ Authorization:`token ${token}` } }
  );
  const json = await res.json();
  data = JSON.parse(atob(json.content));
  renderTable();
}

// Render tabla
function renderTable(query=""){
  const tbody = document.querySelector("#usersTable tbody");
  const headerRow = document.getElementById("tableHeader");

  tbody.innerHTML = "";

  if(headerRow.children.length > 2){
    headerRow.removeChild(headerRow.lastChild);
  }

  if(isAdmin){
    const actionHeader = document.createElement("th");
    actionHeader.textContent = "Acciones";
    headerRow.appendChild(actionHeader);
  }

  data.users
    .filter(u=>u.name.toLowerCase().includes(query.toLowerCase()))
    .forEach(user=>{

      const tr = document.createElement("tr");
      tr.classList.toggle("selected", selectedUser && selectedUser.name===user.name);

      const nameTd = document.createElement("td");
      nameTd.textContent = user.name;
      tr.appendChild(nameTd);

      const pointsTd = document.createElement("td");
      pointsTd.textContent = user.points;
      tr.appendChild(pointsTd);

      if(isAdmin){
        const actionsTd = document.createElement("td");

        const addBtn = document.createElement("button");
        addBtn.textContent="➕";
        addBtn.onclick=()=>{selectedUser=user;addPoint();};
        actionsTd.appendChild(addBtn);

        const subBtn = document.createElement("button");
        subBtn.textContent="➖";
        subBtn.onclick=()=>{selectedUser=user;removePoint();};
        actionsTd.appendChild(subBtn);

        const delBtn = document.createElement("button");
        delBtn.textContent="🗑️";
        delBtn.onclick=()=>{selectedUser=user;removeUser();};
        actionsTd.appendChild(delBtn);

        tr.appendChild(actionsTd);
      }

      tbody.appendChild(tr);
    });
}

// Buscador
document.getElementById("search").addEventListener("input",e=>{
  renderTable(e.target.value);
});

// Login
function login(){
  const u=document.getElementById("adminUser").value.trim();
  const p=document.getElementById("adminPass").value.trim();

  if(u===adminUser && p===adminPass){
    isAdmin=true;
    document.getElementById("errorMsg").innerText="";
    document.getElementById("adminPanel").style.display="block";
    document.getElementById("loginBtn").innerText="Admin conectado";
    renderTable();
  } else {
    document.getElementById("errorMsg").innerText="PENDEJO, ESCRIBE BIEN QUE ESE USUARIO O CONTRASEÑA NO EXISTE.";
  }
}

function logout(){
  isAdmin=false;
  selectedUser=null;
  document.getElementById("adminPanel").style.display="none";
  document.getElementById("loginBtn").innerText="Iniciar sesión";
  renderTable();
}

// Puntos
async function addPoint(){
  selectedUser.points++;
  await saveData();
  renderTable();
}

async function removePoint(){
  selectedUser.points--;
  await saveData();
  renderTable();
}

// Usuarios
function addUserPrompt(){
  const name=prompt("Nuevo usuario:");
  if(!name) return;
  if(data.users.some(u=>u.name.toLowerCase()===name.toLowerCase())){
    alert("Ese usuario ya existe.");
    return;
  }
  data.users.push({name:name.trim(),points:0});
  saveData();
  renderTable();
}

function removeUser(){
  if(!confirm(`Eliminar a ${selectedUser.name}?`)) return;
  data.users=data.users.filter(u=>u.name!==selectedUser.name);
  selectedUser=null;
  saveData();
  renderTable();
}

// Guardar en GitHub
async function saveData(){
  const getFile=await fetch(
    `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`,
    { headers:{ Authorization:`token ${token}` } }
  );
  const file=await getFile.json();

  await fetch(
    `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`,
    {
      method:"PUT",
      headers:{
        Authorization:`token ${token}`,
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        message:"Actualizar datos",
        content:btoa(JSON.stringify(data,null,2)),
        sha:file.sha
      })
    }
  );
}

// Inicial
fetchData();
