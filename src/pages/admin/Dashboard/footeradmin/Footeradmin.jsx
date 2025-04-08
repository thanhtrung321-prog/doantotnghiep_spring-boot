import React from "react";
import {
  Mail,
  Phone,
  Instagram,
  Facebook,
  Twitter,
  MapPin,
  Clock,
} from "lucide-react";

const FooterAdmin = () => {
  return (
    <footer className="bg-orange-100 border-t-4 border-orange-500 px-6 py-4 mt-auto">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-orange-600 font-bold text-lg">
              Beauty Hair Salon
            </h3>
            <p className="text-gray-700 text-sm mt-1">Hệ thống quản lý salon</p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            <div className="flex items-center text-orange-700">
              <Phone size={16} className="mr-2" />
              <span className="text-sm">0987 654 321</span>
            </div>

            <div className="flex items-center text-orange-700">
              <Mail size={16} className="mr-2" />
              <span className="text-sm">contact@beautysalon.com</span>
            </div>

            <div className="flex gap-3">
              <a
                href="#"
                className="text-orange-500 hover:text-orange-700 transition-colors"
              >
                <Facebook size={18} />
              </a>
              <a
                href="#"
                className="text-orange-500 hover:text-orange-700 transition-colors"
              >
                <Instagram size={18} />
              </a>
              <a
                href="#"
                className="text-orange-500 hover:text-orange-700 transition-colors"
              >
                <Twitter size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-orange-200 mt-4 pt-4 flex flex-col md:flex-row justify-between items-center">
          <div className="text-xs text-gray-600">
            © 2025 Beauty Salon. Đã đăng ký bản quyền.
          </div>
          <div className="mt-2 md:mt-0 flex gap-4">
            <a href="#" className="text-xs text-gray-600 hover:text-orange-600">
              Điều khoản
            </a>
            <a href="#" className="text-xs text-gray-600 hover:text-orange-600">
              Chính sách
            </a>
            <a href="#" className="text-xs text-gray-600 hover:text-orange-600">
              Hỗ trợ
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterAdmin;
