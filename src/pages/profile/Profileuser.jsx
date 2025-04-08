import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Profileuser = () => {
  const [user, setUser] = useState(null);

  // Lấy thông tin user từ localStorage khi component mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Nếu chưa có user, hiển thị thông báo
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <h2 className="text-amber-900 text-2xl font-semibold mb-4">
            Vui lòng đăng nhập
          </h2>
          <Link
            to="/login"
            className="text-amber-900 hover:text-amber-600 font-medium underline"
          >
            Đi đến trang đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-amber-900 text-3xl font-semibold mb-6 text-center">
          Hồ Sơ Người Dùng
        </h2>

        {/* Thông tin user */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-amber-900 font-medium">Họ và tên:</span>
            <span className="text-gray-700">{user.fullName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-amber-900 font-medium">Email:</span>
            <span className="text-gray-700">{user.email}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-amber-900 font-medium">Số điện thoại:</span>
            <span className="text-gray-700">{user.phone}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-amber-900 font-medium">Tên đăng nhập:</span>
            <span className="text-gray-700">{user.username}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-amber-900 font-medium">Vai trò:</span>
            <span className="text-gray-700">{user.role}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-amber-900 font-medium">Ngày tạo:</span>
            <span className="text-gray-700">
              {new Date(user.createdAt).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-amber-900 font-medium">
              Cập nhật lần cuối:
            </span>
            <span className="text-gray-700">
              {new Date(user.updatedAt).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Nút chỉnh sửa */}
        <div className="mt-6 flex justify-center">
          <button
            className="bg-amber-900 text-white px-6 py-2 rounded-md hover:bg-amber-700 transition duration-300"
            onClick={() => alert("Chức năng chỉnh sửa đang phát triển!")}
          >
            Chỉnh sửa hồ sơ
          </button>
        </div>

        {/* Nút quay lại */}
        <div className="mt-4 text-center">
          <Link
            to="/"
            className="text-amber-900 hover:text-amber-600 font-medium underline"
          >
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Profileuser;
