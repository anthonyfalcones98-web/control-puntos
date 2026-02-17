const repoOwner = "Antho98";
const repoName = "control-puntos";
const filePath = "data.json";
const token = "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";

let data;
let selectedUser = null;
let isAdmin = false;

async function fetchData() {
  const response = await fetch(
    `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`,
    {
      headers: { Authorization: `token ${token}` }
    }
  );

  const result = await response.json();
  const content = atob(result.content);
  data = JSON.parse(content);
}

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

function selectUser(user) {
  selectedUser = user;
  document.getElementById("result").innerText =
    `${user.name} tiene ${user.points} puntos`;

  if (isAdmin) {
    document.getElementById("adminPanel").style.display = "block";
  }
}

function login() {
  const user = document.getElementById("adminUser").value;
  const pass = document.getElementById("adminPass").value;

  if (user === data.admin.username && pass === data.admin.password) {
    isAdmin = true;
    document.getElementById("errorMsg").innerText = "";
    alert("Administrador logueado");
  } else {
    document.getElementById("errorMsg").innerText =
      "PENDEJO, ESCRIBE BIEN QUE ESE USUARIO O CONTRASEÑA NO EXISTE.";
  }
}

function logout() {
  isAdmin = false;
  document.getElementById("adminPanel").style.display = "none";
  alert("Sesión cerrada");
}

function addPoint() {
  if (!selectedUser) return;
  selectedUser.points += 1;
  saveData();
  selectUser(selectedUser);
}

function removePoint() {
  if (!selectedUser) return;
  selectedUser.points -= 1;
  saveData();
  selectUser(selectedUser);
}

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
        message: "Update points",
        content: btoa(JSON.stringify(data, null, 2)),
        sha: file.sha
      })
    }
  );
}

document.getElementById("search").addEventListener("input", e => {
  showSuggestions(e.target.value);
});

fetchData();

