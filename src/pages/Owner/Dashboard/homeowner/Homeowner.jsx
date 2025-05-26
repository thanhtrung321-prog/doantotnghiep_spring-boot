import React, { useState, useEffect, useRef } from "react";
import {
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Scissors,
  Clock,
  Star,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";

const Homeowner = () => {
  const [bookings, setBookings] = useState([
    {
      id: 1,
      customer: "Nguyễn Văn A",
      service: "Cắt tóc nam",
      time: "09:00",
      date: "2024-05-24",
      status: "confirmed",
      price: 150000,
    },
    {
      id: 2,
      customer: "Trần Thị B",
      service: "Nhuộm tóc",
      time: "14:30",
      date: "2024-05-24",
      status: "pending",
      price: 500000,
    },
    {
      id: 3,
      customer: "Lê Văn C",
      service: "Gội đầu dưỡng sinh",
      time: "16:00",
      date: "2024-05-24",
      status: "completed",
      price: 200000,
    },
  ]);

  const titleRef = useRef(null);

  useEffect(() => {
    // GSAP animations for text
    if (typeof window !== "undefined" && window.gsap) {
      window.gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: -50 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
      );

      window.gsap.fromTo(
        ".stat-card",
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: "back.out(1.7)",
        }
      );
    }

    // AOS initialization
    if (typeof window !== "undefined" && window.AOS) {
      window.AOS.init({
        duration: 800,
        easing: "ease-in-out",
        once: true,
      });
    }
  }, []);

  const StatCard = ({ icon: Icon, title, value, change, color }) => (
    <div
      className={`stat-card bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-${color}-500 transition-all duration-300 hover:shadow-lg hover:shadow-${color}-500/20`}
      data-aos="fade-up"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-2">{value}</p>
          <p className={`text-sm mt-1 text-${color}-400`}>{change}</p>
        </div>
        <div className={`p-3 bg-${color}-500/20 rounded-lg`}>
          <Icon className={`w-6 h-6 text-${color}-400`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1
          ref={titleRef}
          className="text-3xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
        >
          Dashboard Quản Trị Salon
        </h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Calendar}
            title="Lịch hẹn hôm nay"
            value="12"
            change="+2 so với hôm qua"
            color="blue"
          />
          <StatCard
            icon={Users}
            title="Khách hàng mới"
            value="3"
            change="+1 tuần này"
            color="green"
          />
          <StatCard
            icon={DollarSign}
            title="Doanh thu hôm nay"
            value="2.5M"
            change="+15% so với hôm qua"
            color="purple"
          />
          <StatCard
            icon={TrendingUp}
            title="Tăng trưởng"
            value="18%"
            change="So với tháng trước"
            color="orange"
          />
        </div>

        {/* Recent Bookings */}
        <div
          className="bg-gray-800 rounded-xl border border-gray-700 p-6"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          <h2 className="text-xl font-semibold mb-4">Lịch hẹn gần đây</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left px-6 py-3 text-gray-400 font-medium">
                    Khách hàng
                  </th>
                  <th className="text-left px-6 py-3 text-gray-400 font-medium">
                    Dịch vụ
                  </th>
                  <th className="text-left px-6 py-3 text-gray-400 font-medium">
                    Giờ
                  </th>
                  <th className="text-left px-6 py-3 text-gray-400 font-medium">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 3).map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-white">{booking.customer}</td>
                    <td className="px-6 py-4 text-gray-300">
                      {booking.service}
                    </td>
                    <td className="px-6 py-4 text-gray-300">{booking.time}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          booking.status === "confirmed"
                            ? "bg-green-500/20 text-green-400"
                            : booking.status === "pending"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-blue-500/20 text-blue-400"
                        }`}
                      >
                        {booking.status === "confirmed"
                          ? "Đã xác nhận"
                          : booking.status === "pending"
                          ? "Chờ xác nhận"
                          : "Hoàn thành"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Load GSAP and AOS */}
      <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
      <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet" />
      <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
    </div>
  );
};

export default Homeowner;
