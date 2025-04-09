import React, { useState } from "react";
import {
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  Scissors,
  DollarSign,
  Tag,
} from "lucide-react";

const Bookings = () => {
  const [bookings, setBookings] = useState([
    {
      id: 1,
      customer_id: 101,
      start_time: "2025-04-09T10:00:00",
      end_time: "2025-04-09T11:30:00",
      salon_id: 201,
      status: "confirmed",
      total_price: 85.0,
    },
    {
      id: 2,
      customer_id: 102,
      start_time: "2025-04-09T13:00:00",
      end_time: "2025-04-09T14:00:00",
      salon_id: 201,
      status: "pending",
      total_price: 45.0,
    },
    {
      id: 3,
      customer_id: 103,
      start_time: "2025-04-10T15:30:00",
      end_time: "2025-04-10T17:00:00",
      salon_id: 202,
      status: "completed",
      total_price: 120.0,
    },
    {
      id: 4,
      customer_id: 104,
      start_time: "2025-04-11T09:00:00",
      end_time: "2025-04-11T10:00:00",
      salon_id: 203,
      status: "cancelled",
      total_price: 60.0,
    },
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Quản lý đặt lịch</h1>

      {/* Search and filter bar */}
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm đặt lịch..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex space-x-2">
          <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="h-5 w-5 mr-2" />
            Lọc
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            + Thêm đặt lịch
          </button>
        </div>
      </div>

      {/* Booking table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                ID
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Khách hàng
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Thời gian bắt đầu
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Thời gian kết thúc
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Salon
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Trạng thái
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Tổng tiền
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{booking.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-gray-400" />
                    {booking.customer_id}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    {formatDateTime(booking.start_time)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    {formatDateTime(booking.end_time)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <Scissors className="h-4 w-4 mr-2 text-gray-400" />
                    {booking.salon_id}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                      booking.status
                    )}`}
                  >
                    {booking.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                    {booking.total_price.toLocaleString("vi-VN")} đ
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      Sửa
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4 rounded-lg shadow">
        <div className="flex flex-1 justify-between sm:hidden">
          <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Trước
          </button>
          <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Sau
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Hiển thị <span className="font-medium">1</span> đến{" "}
              <span className="font-medium">4</span> của{" "}
              <span className="font-medium">4</span> kết quả
            </p>
          </div>
          <div>
            <nav
              className="isolate inline-flex -space-x-px rounded-md shadow-sm"
              aria-label="Pagination"
            >
              <button className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                Trước
              </button>
              <button className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-blue-600 focus:z-20">
                1
              </button>
              <button className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                Sau
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bookings;
