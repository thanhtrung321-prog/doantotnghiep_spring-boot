import React from "react";

const Silider = () => {
  return (
    <div className="relative h-96 bg-gradient-to-r from-amber-800 to-amber-600 mt-16">
      <div className="absolute inset-0 bg-black opacity-40"></div>
      <div className="container mx-auto px-4 h-full flex items-center relative z-10">
        <div className="max-w-lg">
          <h2 className="text-4xl font-bold text-white mb-4">
            Khám Phá Vẻ Đẹp Tự Nhiên
          </h2>
          <p className="text-white text-lg mb-6">
            Nơi chăm sóc và tạo kiểu tóc chuyên nghiệp hàng đầu Việt Nam
          </p>
          <button className="bg-white text-amber-800 px-6 py-2 rounded-full font-medium hover:bg-amber-100 transition">
            Đặt Lịch Ngay
          </button>
        </div>
      </div>
    </div>
  );
};

export default Silider;
