const loginUser = async (email, password) => {
  try {
    const response = await fetch("http://localhost:8082/user");

    if (!response.ok) {
      throw new Error(
        `Không thể lấy danh sách người dùng: ${response.statusText}`
      );
    }

    const users = await response.json();

    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) throw new Error("Email hoặc mật khẩu không đúng!");

    const fakeToken = btoa(`${email}:${password}`);
    localStorage.setItem("token", fakeToken);
    localStorage.setItem("user", JSON.stringify(user));

    console.log("Đăng nhập thành công:", user);
    return user;
  } catch (error) {
    console.error("Lỗi khi đăng nhập:", error.message);
    return null;
  }
};

const loginWithGoogle = async (idToken) => {
  try {
    const response = await fetch("http://localhost:8082/user/google", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
      throw new Error(`Lỗi khi đăng nhập bằng Google: ${response.statusText}`);
    }

    const user = await response.json();

    localStorage.setItem("token", user.token);
    localStorage.setItem("user", JSON.stringify(user));

    console.log("Đăng nhập Google thành công:", user);
    return user;
  } catch (error) {
    console.error("Lỗi khi đăng nhập Google:", error.message);
    return null;
  }
};

const loginWithFacebook = async (accessToken) => {
  try {
    const response = await fetch("http://localhost:8082/user/facebook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ accessToken }),
    });

    if (!response.ok) {
      throw new Error(
        `Lỗi khi đăng nhập bằng Facebook: ${response.statusText}`
      );
    }

    const user = await response.json();

    localStorage.setItem("token", user.token);
    localStorage.setItem("user", JSON.stringify(user));

    console.log("Đăng nhập Facebook thành công:", user);
    return user;
  } catch (error) {
    console.error("Lỗi khi đăng nhập Facebook:", error.message);
    return null;
  }
};

export { loginUser, loginWithGoogle, loginWithFacebook };
