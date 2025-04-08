const registerUser = async (newUser) => {
  try {
    // Mock dữ liệu
    const createdUser = {
      id: Date.now(),
      full_name: newUser.full_name,
      email: newUser.email,
      password: newUser.password,
      phone: newUser.phone || "",
      username: newUser.username,
      role: "USER",
      created_at: newUser.created_at,
      updated_at: newUser.updated_at,
    };

    const fakeToken = btoa(`${createdUser.email}:${createdUser.password}`);
    localStorage.setItem("token", fakeToken);
    localStorage.setItem("user", JSON.stringify(createdUser));

    console.log("Đăng ký thành công:", createdUser);
    return createdUser;
  } catch (error) {
    console.error("Lỗi khi đăng ký:", error.message);
    throw error;
  }
};

export default registerUser;
