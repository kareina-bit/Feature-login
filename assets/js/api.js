export function getUsers() {
  return JSON.parse(localStorage.getItem("shipway_users") || "[]");
}

export function saveUsers(users) {
  localStorage.setItem("shipway_users", JSON.stringify(users));
}

export function findUser(phone) {
  return getUsers().find(u => u.phone === phone);
}
