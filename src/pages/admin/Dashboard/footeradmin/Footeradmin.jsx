import React, { useEffect, useState } from "react";
import { Mail, Phone } from "lucide-react";

const FooterAdmin = () => {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();

      const day = now.getDate().toString().padStart(2, "0");
      const month = (now.getMonth() + 1).toString().padStart(2, "0"); // tháng bắt đầu từ 0
      const year = now.getFullYear();

      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const seconds = now.getSeconds().toString().padStart(2, "0");

      const formattedTime = `${day}/${month}/${year} - ${hours}:${minutes}:${seconds}`;
      setCurrentTime(formattedTime);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="bg-indigo-900 text-indigo-100 px-6 py-4 mt-auto border-t border-indigo-500">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Thông tin hệ thống */}
          <div className="text-sm">
            <h3 className="font-semibold text-orange-300 text-lg">
              Beauty Salon - Admin Dashboard
            </h3>
            <p className="text-indigo-200">Hệ thống quản trị salon</p>
          </div>

          {/* Thông tin liên hệ */}
          <div className="flex flex-col md:flex-row items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Phone size={16} className="text-orange-300" />
              <span>0987 654 321</span>
            </div>
            <div className="flex items-center gap-1">
              <Mail size={16} className="text-orange-300" />
              <span>admin@beautysalon.com</span>
            </div>
          </div>
        </div>

        {/* Ngày giờ hiện tại */}
        <div className="mt-4 text-center text-sm text-orange-200 font-medium">
          Thời gian hiện tại: {currentTime}
        </div>

        <div className="mt-2 border-t border-indigo-400 pt-3 text-xs text-center text-indigo-200"></div>
      </div>
    </footer>
  );
};

export default FooterAdmin;
