import React, { useState, useEffect } from "react";
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
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  fetchBookings,
  fetchServices,
  updateBookingStatus,
} from "../../api/apiadmin/bookingadmin";
import axios from "axios";

const Bookings = () => {
  const [salonId, setSalonId] = useState(""); // Initialize empty
  const [salons, setSalons] = useState([]); // Store salons from API
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch salons on component mount
  useEffect(() => {
    const fetchSalons = async () => {
      try {
        const response = await axios.get("http://localhost:8084/salon");
        setSalons(response.data);
        if (response.data.length > 0) {
          setSalonId(response.data[0].id.toString()); // Set default to first salon
        }
      } catch (error) {
        console.error("Error fetching salons:", error);
        toast.error("Failed to fetch salons");
      }
    };
    fetchSalons();
  }, []);

  // Fetch bookings and services when salonId changes
  useEffect(() => {
    if (!salonId) return; // Skip if no salonId
    const loadData = async () => {
      setLoading(true);
      try {
        const [fetchedBookings, fetchedServices] = await Promise.all([
          fetchBookings(salonId),
          fetchServices(salonId),
        ]);
        setBookings(fetchedBookings);
        setServices(fetchedServices);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [salonId]);

  // Handle status update
  const handleStatusUpdate = async (bookingId, status) => {
    try {
      await updateBookingStatus(bookingId, status);
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId ? { ...booking, status } : booking
        )
      );
      toast.success(`Booking ${status.toLowerCase()} successfully`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Format date and time
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

  // Get status color
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
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

  return (
    <div className="min-h-screen min-w-screen  bg-gradient-to-br from-slate-900 to-gray-900 text-white p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Quản lý đặt lịch</h1>

      {/* Salon selection */}
      <div className="mb-6">
        <label
          htmlFor="salonId"
          className="block text-sm font-medium text-gray-200"
        >
          Chọn salon
        </label>
        <select
          id="salonId"
          value={salonId}
          onChange={(e) => setSalonId(e.target.value)}
          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white text-gray-900 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          {salons.length === 0 ? (
            <option value="">Loading salons...</option>
          ) : (
            salons.map((salon) => (
              <option key={salon.id} value={salon.id}>
                {salon.name} (ID: {salon.id})
              </option>
            ))
          )}
        </select>
      </div>

      {/* Search and filter bar */}
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm đặt lịch..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex space-x-2">
          <button className="flex items-center px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="h-5 w-5 mr-2 text-gray-400" />
            Lọc
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            + Thêm đặt lịch
          </button>
        </div>
      </div>

      {/* Booking table */}
      <div className="overflow-x-auto bg-white text-gray-900 rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Khách hàng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thời gian bắt đầu
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thời gian kết thúc
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Salon
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tổng tiền
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hành động
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dịch vụ
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : bookings.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
                  No bookings found
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{booking.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      {booking.customerId}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      {formatDateTime(booking.startTime)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      {formatDateTime(booking.endTime)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Scissors className="h-4 w-4 mr-2 text-gray-400" />
                      {booking.salonId}
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
                      {booking.totalPrice.toLocaleString("vi-VN")} đ
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {booking.status.toLowerCase() === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              handleStatusUpdate(booking.id, "CONFIRMED")
                            }
                            className="text-green-600 hover:text-green-900"
                          >
                            Xác nhận
                          </button>
                          <button
                            onClick={() =>
                              handleStatusUpdate(booking.id, "CANCELLED")
                            }
                            className="text-red-600 hover:text-red-900"
                          >
                            Từ chối
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Tag className="h-4 w-4 mr-2 text-gray-400" />
                      {booking.serviceIds
                        .map((id) => services[id] || `Service ${id}`)
                        .join(", ")}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-gray-200 bg-white text-gray-900 px-4 py-3 sm:px-6 mt-4 rounded-lg shadow">
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
              <span className="font-medium">{bookings.length}</span> của{" "}
              <span className="font-medium">{bookings.length}</span> kết quả
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

      <ToastContainer />
    </div>
  );
};

export default Bookings;
