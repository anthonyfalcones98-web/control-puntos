
// ================================================
// === CONFIGURACIÓN GITHUB (HARDCODEADA) ===
// ================================================
// ¡¡¡ CAMBIA ESTOS 3 VALORES CON TUS DATOS REALES !!!
const GITHUB_TOKEN = "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";   // ← TU TOKEN AQUÍ
const GITHUB_OWNER = "tanthonyfalcones98-web";                         // ← tu usuario de GitHub
const GITHUB_REPO  = "control-puntos";                  // ← nombre del repo

// ================================================

let data = [];
let filteredData = [];
let selectedUser = null;
let isAdmin = false;
let autoSaveEnabled = true;

const ADMIN_USER = "admin";
const ADMIN_PASS = "admin123";

async function loadData() {
  try {
    const res = await fetch('data.json?' + Date.now());
    data = await res.json();
    filteredData = [...data];
    renderCards();
  } catch (e) {
    console.error("Error cargando data.json:", e);
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
  document.getElementById('selectedPanel').classList.remove('hidden');
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
  setTimeout(() => status.textContent = '', 5000);
}

async function saveToGitHubInternal() {
  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    showStatus("❌ Config GitHub incompleta", "bg-red-100 text-red-700");
    return false;
  }

  showStatus("Guardando...", "bg-amber-100 text-amber-700");

  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/data.json`;

  try {
    // Obtener SHA
    let sha = null;
    const getRes = await fetch(url, {
      headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github.v3+json' }
    });

    if (getRes.status === 200) {
      const file = await getRes.json();
      sha = file.sha;
    } else if (getRes.status !== 404) {
      throw new Error(`GET error: ${getRes.status}`);
    }

    const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));

    const body = {
      message: "Cambio desde app web",
      content: content,
      ...(sha && { sha })
    };

    const putRes = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (putRes.ok) {
      showStatus("✅ Guardado OK", "bg-green-100 text-green-700");
      return true;
    } else {
      const err = await putRes.json();
      showStatus(`❌ ${err.message || 'Error ' + putRes.status}`, "bg-red-100 text-red-700");
      return false;
    }
  } catch (err) {
    showStatus("❌ Falló conexión", "bg-red-100 text-red-700");
    console.error(err);
    return false;
  }
}

function addPoint() {
  if (!isAdmin || !selectedUser) return;
  selectedUser.points++;
  document.getElementById('selectedPoints').textContent = selectedUser.points;
  renderCards();
  if (autoSaveEnabled) saveToGitHubInternal();
}

function removePoint() {
  if (!isAdmin || !selectedUser) return;
  if (selectedUser.points > 0) {
    selectedUser.points--;
    document.getElementById('selectedPoints').textContent = selectedUser.points;
    renderCards();
    if (autoSaveEnabled) saveToGitHubInternal();
  }
}

function deletePerson() {
  if (!isAdmin || !selectedUser) return alert("Selecciona primero un participante");
  if (confirm(`¿Eliminar ${selectedUser.name}?`)) {
    data = data.filter(p => p.name !== selectedUser.name);
    filteredData = filteredData.filter(p => p.name !== selectedUser.name);
    selectedUser = null;
    document.getElementById('selectedPanel').classList.add('hidden');
    renderCards();
    if (autoSaveEnabled) saveToGitHubInternal();
  }
}

function addNewName() {
  if (!isAdmin) return;
  const name = prompt("Nombre completo:");
  if (!name || !name.trim()) return;
  const clean = name.trim();
  if (data.some(p => p.name.toLowerCase() === clean.toLowerCase())) return alert("Ya existe");
  data.push({ name: clean, points: 0 });
  filteredData = [...data];
  renderCards();
  if (autoSaveEnabled) saveToGitHubInternal();
}

function toggleAutoSave() {
  autoSaveEnabled = document.getElementById('autoSaveToggle').checked;
}

window.onload = loadData;
