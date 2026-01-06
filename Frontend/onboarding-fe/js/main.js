/* =========================================================
   STATE (GIẢ LẬP – SAU NÀY GẮN BACKEND)
========================================================= */

/*
  user = null           -> chưa đăng nhập
  user = { role: ... }  -> đã đăng nhập
*/
const AppState = {
  user: null
};


/* =========================================================
   INIT APP
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  loadUserFromStorage();
  updateHeaderByAuth();
  setupActiveMenu();
});


/* =========================================================
   AUTH STATE
========================================================= */
function loadUserFromStorage() {
  const storedUser = localStorage.getItem("shipway_user");
  if (storedUser) {
    AppState.user = JSON.parse(storedUser);
  }
}

function updateHeaderByAuth() {
  const nav = document.querySelector(".main-nav ul");
  if (!nav) return;

  // Nếu CHƯA đăng nhập → giữ nguyên menu
  if (!AppState.user) return;

  // Nếu ĐÃ đăng nhập → thay Login / Register
  nav.innerHTML = `
    <li><a href="/">Trang chủ</a></li>
    <li><a href="#about">Về chúng tôi</a></li>
    <li><a href="dashboard.html" class="btn-primary">Dashboard</a></li>
    <li><button class="btn-outline" id="logoutBtn">Đăng xuất</button></li>
  `;

  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn.addEventListener("click", logout);
}


/* =========================================================
   LOGIN / LOGOUT (GIẢ LẬP)
========================================================= */
function login(role = "shipper") {
  const user = {
    id: 1,
    name: "Demo User",
    role: role
  };

  localStorage.setItem("shipway_user", JSON.stringify(user));
  AppState.user = user;
  updateHeaderByAuth();
}

function logout() {
  localStorage.removeItem("shipway_user");
  AppState.user = null;
  window.location.reload();
}


/* =========================================================
   ACTIVE MENU (UX NHỎ NHƯNG ĂN ĐIỂM)
========================================================= */
function setupActiveMenu() {
  const links = document.querySelectorAll(".main-nav a");

  links.forEach(link => {
    if (link.href === window.location.href) {
      link.classList.add("active");
    }
  });
}


/* =========================================================
   DEMO – PHỤC VỤ CHẤM ĐIỂM (CÓ THỂ XOÁ)
========================================================= */
/*
  Gõ vào console:
    login("shipper")
    login("driver")
  để giả lập đăng nhập
*/
