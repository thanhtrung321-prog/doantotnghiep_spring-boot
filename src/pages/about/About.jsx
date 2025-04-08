import React from "react";

const about = () => {
  return (
    <div className="bg-amber-50 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-amber-800 mb-2">
            Tại Sao Chọn Chúng Tôi
          </h3>
          <div className="w-24 h-1 bg-amber-600 mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-amber-600 flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-amber-800 mb-2">
              5+ Năm Kinh Nghiệm
            </h4>
            <p className="text-gray-600">
              Đội ngũ stylist với nhiều năm kinh nghiệm trong ngành làm đẹp.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-amber-600 flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-amber-800 mb-2">
              Sản Phẩm Cao Cấp
            </h4>
            <p className="text-gray-600">
              Sử dụng các thương hiệu quốc tế và sản phẩm tự nhiên tốt nhất.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-amber-600 flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-amber-800 mb-2">
              Xu Hướng Mới Nhất
            </h4>
            <p className="text-gray-600">
              Luôn cập nhật các kiểu tóc và xu hướng làm đẹp mới nhất.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-amber-600 flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-amber-800 mb-2">
              Không Gian Thư Giãn
            </h4>
            <p className="text-gray-600">
              Môi trường sang trọng và thoải mái cho trải nghiệm làm đẹp tuyệt
              vời.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default about;
