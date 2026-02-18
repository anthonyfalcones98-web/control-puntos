
// ---------- CONFIGURACIÓN ----------
const repoOwner = "";
const repoName = "";

const token = "";

// ================================================
// === CONFIGURACIÓN GITHUB (HARDCODEADA) ===
// ================================================
// ¡¡¡ CAMBIA ESTOS 3 VALORES CON TUS DATOS REALES !!!
const GITHUB_TOKEN = "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";   // ← TU TOKEN AQUÍ
const GITHUB_OWNER = "tanthonyfalcones98-web";                         // ← tu usuario de GitHub
const GITHUB_REPO  = "control-puntos";                  // ← nombre del repo
const filePath = "data.json";                    // ← datos del repo 

// ================================================

let data = [];
let filteredData = [];
let selectedUser = null;
let isAdmin = false;
let autoSaveEnabled = true;
let saveTimeout = null;

const ADMIN_USER = "admin";
const ADMIN_PASS = "admin123";

async function loadData() {
  try {
    const res = await fetch('data.json?' + Date.now());
    data = await res.json();
    filteredData = [...data];
    renderCards();
  } catch (e) {
    console.error(e);
  }
}

function renderCards() {
  const grid = document.getElementById('participantsGrid');
  grid.innerHTML = '';
  filteredData.forEach(person => {
    const isSelected = selectedUser && selectedUser.name === person.name;
    const card = document.createElement('div');
    card.className = `card bg-white rounded-3xl p-8 shadow-xl cursor-pointer border-4 ${isSelected ? 'border-indigo-500' : 'border-transparent'}`;
    card.innerHTML = `
      <div class="text-3xl font-bold text-zinc-800 mb-6">${person.name}</div>
      <div class="text-7xl font-black text-indigo-600">${person.points}</div>
      <div class="text-zinc-400 mt-1">puntos</div>
    `;
    card.onclick = () => selectUser(person);
    grid.appendChild(card);
  });
}

function selectUser(person) {
  selectedUser = person;
  const panel = document.getElementById('selectedPanel');
  panel.classList.remove('hidden');
  document.getElementById('selectedName').textContent = person.name;
  document.getElementById('selectedPoints').textContent = person.points;
  renderCards();
}

document.getElementById('searchInput').addEventListener('input', (e) => {
  const term = e.target.value.toLowerCase().trim();
  filteredData = data.filter(p => p.name.toLowerCase().includes(term));
  renderCards();
});

function showLoginModal() { document.getElementById('loginModal').classList.remove('hidden'); }
function hideLoginModal() { document.getElementById('loginModal').classList.add('hidden'); }

function attemptLogin() {
  const user = document.getElementById('username').value.trim();
  const pass = document.getElementById('password').value.trim();
  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    isAdmin = true;
    hideLoginModal();
    document.getElementById('adminToolbar').classList.remove('hidden');
  } else {
    alert("pendejo, escribe bien que ese usuario o contraseña no existe.");
  }
}

function logout() {
  if (confirm("¿Cerrar sesión?")) {
    isAdmin = false;
    document.getElementById('adminToolbar').classList.add('hidden');
  }
}

function showStatus(text, colorClass) {
  const status = document.getElementById('saveStatus');
  status.textContent = text;
  status.className = `px-5 py-2 text-sm font-medium rounded-2xl ${colorClass}`;
  setTimeout(() => status.classList.add('hidden'), 3000);
}

async function saveToGitHubInternal() {
  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    showStatus("❌ Falta configurar GitHub en el código", "bg-red-100 text-red-700");
    return false;
  }
  showStatus("Guardando en GitHub...", "bg-amber-100 text-amber-700");
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/data.json`;
  try {
    let sha = null;
    const getRes = await fetch(url, { headers: { Authorization: `token ${GITHUB_TOKEN}` } });
    if (getRes.status === 200) sha = (await getRes.json()).sha;

    const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));

    const body = {
      message: "Auto-guardado desde web",
      content: content,
      sha: sha
    };

    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Authorization": `token ${GITHUB_TOKEN}`,
        "Accept": "application/vnd.github.v3+json"
      },
      body: JSON.stringify(body)
    });

    if (res.ok) {
      showStatus("✅ Guardado automáticamente", "bg-green-100 text-green-700");
      return true;
    } else {
      showStatus("❌ Error al guardar", "bg-red-100 text-red-700");
      return false;
    }
  } catch (e) {
    showStatus("❌ No se pudo conectar a GitHub", "bg-red-100 text-red-700");
    return false;
  }
}

function debounceSave() {
  if (!autoSaveEnabled) return;
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => saveToGitHubInternal(), 1500);
}

function addPoint() {
  if (!isAdmin || !selectedUser) return;
  selectedUser.points++;
  document.getElementById('selectedPoints').textContent = selectedUser.points;
  renderCards();
  debounceSave();
}

function removePoint() {
  if (!isAdmin || !selectedUser) return;
  if (selectedUser.points > 0) selectedUser.points--;
  document.getElementById('selectedPoints').textContent = selectedUser.points;
  renderCards();
  debounceSave();
}

function deletePerson() {
  if (!isAdmin || !selectedUser) return alert("Selecciona primero un participante");
  if (confirm(`¿Eliminar permanentemente a ${selectedUser.name}?`)) {
    data = data.filter(p => p.name !== selectedUser.name);
    filteredData = filteredData.filter(p => p.name !== selectedUser.name);
    selectedUser = null;
    document.getElementById('selectedPanel').classList.add('hidden');
    renderCards();
    debounceSave();
  }
}

function addNewName() {
  if (!isAdmin) return;
  const name = prompt("Nombre completo del nuevo participante:");
  if (!name || !name.trim()) return;
  const clean = name.trim();
  if (data.some(p => p.name.toLowerCase() === clean.toLowerCase())) return alert("Ese nombre ya existe");
  const nuevo = { name: clean, points: 0 };
  data.push(nuevo);
  filteredData.push(nuevo);
  renderCards();
  debounceSave();
}

function refreshData() {
  loadData();
  alert("✅ Datos recargados");
}

function toggleAutoSave() {
  autoSaveEnabled = document.getElementById('autoSaveToggle').checked;
}

window.onload = loadData;
