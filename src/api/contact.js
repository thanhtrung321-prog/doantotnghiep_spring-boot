const submitContactForm = async (formData) => {
  try {
    const response = await fetch("http://localhost:8084/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Lỗi khi gửi tin nhắn");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(error.message || "Lỗi mạng, vui lòng thử lại sau");
  }
};

export { submitContactForm };
