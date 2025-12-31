export function getUsers() {
  const users = JSON.parse(localStorage.getItem("shipway_users") || "[]");
  
  // Khởi tạo tài khoản test nếu chưa có
  if (users.length === 0) {
    const testUser = {
      phone: "0123456789",
      name: "Nguyễn Văn Test",
      password: "test123"
    };
    users.push(testUser);
    saveUsers(users);
    console.log("✅ Đã tạo tài khoản test:");
    console.log("   📱 Số điện thoại: 0123456789");
    console.log("   🔑 Mật khẩu: test123");
    console.log("   👤 Tên: Nguyễn Văn Test");
  }
  
  return users;
}

export function saveUsers(users) {
  localStorage.setItem("shipway_users", JSON.stringify(users));
}

export function findUser(phone) {
  return getUsers().find(u => u.phone === phone);
}
