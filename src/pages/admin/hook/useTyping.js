import { useEffect, useState } from "react";

export const useTypingEffect = (text, delay = 100) => {
  const [displayedText, setDisplayedText] = useState(""); // Trạng thái để lưu chuỗi đang hiển thị

  useEffect(() => {
    // Nếu không có văn bản thì hiển thị chuỗi rỗng
    if (!text) {
      setDisplayedText("");
      return;
    }

    let index = 0; // Khởi tạo chỉ số để truy cập từng ký tự trong chuỗi
    setDisplayedText(""); // Đặt lại chuỗi hiển thị trước khi bắt đầu

    // Đặt interval để thêm từng ký tự vào chuỗi hiển thị
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText((prev) => prev + text[index]); // Thêm ký tự vào chuỗi hiển thị
        index++; // Tiến đến ký tự tiếp theo
      } else {
        clearInterval(interval); // Dừng interval khi tất cả ký tự đã được hiển thị
      }
    }, delay);

    return () => clearInterval(interval); // Dọn dẹp interval khi component unmount hoặc text thay đổi
  }, [text, delay]);

  return displayedText; // Trả về chuỗi đang được hiển thị
};
