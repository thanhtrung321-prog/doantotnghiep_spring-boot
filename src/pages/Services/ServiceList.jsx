import React from "react";

const ServiceList = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h3 className="text-3xl font-bold text-amber-800 mb-2">
          Dịch Vụ Của Chúng Tôi
        </h3>
        <div className="w-24 h-1 bg-amber-600 mx-auto"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
          <div className="h-48 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-amber-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z"
              />
            </svg>
          </div>
          <h4 className="text-xl font-semibold text-amber-800 mb-2">
            Cắt Tóc Nghệ Thuật
          </h4>
          <p className="text-gray-600">
            Đội ngũ stylist hàng đầu với kỹ thuật cắt tóc hiện đại, phù hợp với
            khuôn mặt và phong cách của bạn.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
          <div className="h-48 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-amber-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
              />
            </svg>
          </div>
          <h4 className="text-xl font-semibold text-amber-8 00 mb-2">
            Nhuộm & Highlight
          </h4>
          <p className="text-gray-600">
            Các dịch vụ nhuộm tóc chuyên nghiệp với sản phẩm cao cấp, bảo vệ tóc
            và da đầu.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
          <div className="h-48 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-amber-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
          </div>
          <h4 className="text-xl font-semibold text-amber-800 mb-2">
            Spa & Điều Trị
          </h4>
          <p className="text-gray-600">
            Chăm sóc và phục hồi tóc hư tổn với các liệu pháp tiên tiến và sản
            phẩm tự nhiên.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ServiceList;
