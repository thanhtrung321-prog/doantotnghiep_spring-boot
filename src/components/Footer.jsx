import React from "react";

const Footer = () => {
  return (
    <footer className="bg-amber-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h5 className="text-xl font-bold mb-4">Beauty Salon</h5>
            <p className="mb-4">
              Nơi chăm sóc và tạo kiểu tóc chuyên nghiệp hàng đầu Việt Nam.
              Chúng tôi cam kết mang đến cho bạn trải nghiệm làm đẹp tuyệt vời.
            </p>
          </div>
          <div>
            <h5 className="text-lg font-bold mb-4">Liên Kết Nhanh</h5>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-amber-300 transition">
                  Trang Chủ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-amber-300 transition">
                  Dịch Vụ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-amber-300 transition">
                  Mẫu Tóc
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-amber-300 transition">
                  Đặt Lịch
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-amber-300 transition">
                  Liên Hệ
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="text-lg font-bold mb-4">Dịch Vụ</h5>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-amber-300 transition">
                  Cắt Tóc
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-amber-300 transition">
                  Nhuộm Tóc
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-amber-300 transition">
                  Uốn Tóc
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-amber-300 transition">
                  Duỗi Tóc
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-amber-300 transition">
                  Spa Tóc
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="text-lg font-bold mb-4">Liên Hệ</h5>
            <ul className="space-y-2">
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 mt-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>236 Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh</span>
              </li>
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 mt-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span>0912 345 678</span>
              </li>
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 mt-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span>info@salonbeautysalon.vn</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-amber-800 mt-8 pt-8 text-center">
          <p>© 2025 Beauty Salon. Tất cả các quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
