if (!localStorage.getItem("admin")) {
  window.location = "index.html";
}

let designs = JSON.parse(localStorage.getItem("designs")) || [];
let clients = JSON.parse(localStorage.getItem("clients")) || [];

function showSection(id) {
  document.querySelectorAll("section").forEach(s => s.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
  localStorage.setItem("lastSection", id);
}

showSection(localStorage.getItem("lastSection") || "dashboard");

function addDesign() {
  designs.push({
    title: title.value,
    category: category.value,
    featured: featured.checked
  });
  localStorage.setItem("designs", JSON.stringify(designs));
  render();
}

function addClient() {
  clients.push({
    name: clientName.value,
    email: clientEmail.value
  });
  localStorage.setItem("clients", JSON.stringify(clients));
  render();
}

function render() {
  portfolioList.innerHTML = designs.map(d =>
    `<div>${d.title} (${d.category}) ${d.featured ? "⭐" : ""}</div>`
  ).join("");

  clientList.innerHTML = clients.map(c =>
    `<li>${c.name} - ${c.email}</li>`
  ).join("");

  uploadCount.innerText = designs.length;
  clientCount.innerText = clients.length;
  featuredCount.innerText = designs.filter(d => d.featured).length;
}

render();

function logout() {
  localStorage.removeItem("admin");
  window.location = "index.html";
}
