// loginUser.js
const loginUser = async (email, password) => {
  try {
    const response = await fetch("http://localhost:8082/user");

    if (!response.ok) throw new Error("Không thể lấy danh sách người dùng!");

    const users = await response.json();

    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) throw new Error("Email hoặc mật khẩu không đúng!");

    // Giả lập token và lưu user vào localStorage
    const fakeToken = btoa(`${email}:${password}`);
    localStorage.setItem("token", fakeToken);
    localStorage.setItem("user", JSON.stringify(user)); // 👈 Lưu user

    console.log("Đăng nhập thành công:", user);
    return user;
  } catch (error) {
    console.error("Lỗi khi đăng nhập:", error.message);
    return null;
  }
};

export default loginUser;
