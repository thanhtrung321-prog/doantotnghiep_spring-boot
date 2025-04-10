import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

const Homestaff = () => {
  const [view, setView] = useState("table");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [dateFilter, setDateFilter] = useState("today");
  const [customDateRange, setCustomDateRange] = useState({
    start: moment().format("YYYY-MM-DD"),
    end: moment().format("YYYY-MM-DD"),
  });
  const [statusFilter, setStatusFilter] = useState("all");
  const threeCanvasRef = useRef(null);

  // Mock data
  useEffect(() => {
    setTimeout(() => {
      const mockBookings = [
        {
          id: 1,
          customerName: "Lisa Johnson",
          serviceName: "Hair Coloring + Cut",
          serviceId: 101,
          startTime: moment().hour(10).minute(0).second(0).toDate(),
          endTime: moment().hour(12).minute(0).second(0).toDate(),
          status: "confirmed",
          notes: "Blonde highlights, trim ends only",
          customerPhone: "123-456-7890",
        },
        {
          id: 2,
          customerName: "Michael Smith",
          serviceName: "Men's Haircut",
          serviceId: 102,
          startTime: moment()
            .add(1, "days")
            .hour(14)
            .minute(0)
            .second(0)
            .toDate(),
          endTime: moment()
            .add(1, "days")
            .hour(15)
            .minute(0)
            .second(0)
            .toDate(),
          status: "pending",
          notes: "Short on sides, leave top longer",
          customerPhone: "234-567-8901",
        },
        {
          id: 3,
          customerName: "Jennifer Davis",
          serviceName: "Manicure & Pedicure",
          serviceId: 103,
          startTime: moment()
            .subtract(1, "days")
            .hour(11)
            .minute(0)
            .second(0)
            .toDate(),
          endTime: moment()
            .subtract(1, "days")
            .hour(13)
            .minute(0)
            .second(0)
            .toDate(),
          status: "canceled",
          notes: "Red polish for nails",
          customerPhone: "345-678-9012",
        },
        {
          id: 4,
          customerName: "Robert Williams",
          serviceName: "Beard Trim",
          serviceId: 104,
          startTime: moment().hour(16).minute(0).second(0).toDate(),
          endTime: moment().hour(16).minute(30).second(0).toDate(),
          status: "confirmed",
          notes: "Clean shape, not too short",
          customerPhone: "456-789-0123",
        },
        {
          id: 5,
          customerName: "Sarah Miller",
          serviceName: "Full Facial",
          serviceId: 105,
          startTime: moment()
            .add(2, "days")
            .hour(13)
            .minute(0)
            .second(0)
            .toDate(),
          endTime: moment()
            .add(2, "days")
            .hour(14)
            .minute(30)
            .second(0)
            .toDate(),
          status: "pending",
          notes: "Sensitive skin, avoid fragrance",
          customerPhone: "567-890-1234",
        },
        {
          id: 6,
          customerName: "David Brown",
          serviceName: "Hair Color Touch-up",
          serviceId: 106,
          startTime: moment()
            .add(1, "days")
            .hour(10)
            .minute(0)
            .second(0)
            .toDate(),
          endTime: moment()
            .add(1, "days")
            .hour(11)
            .minute(30)
            .second(0)
            .toDate(),
          status: "confirmed",
          notes: "Match previous color (dark brown)",
          customerPhone: "678-901-2345",
        },
        {
          id: 7,
          customerName: "Emily Wilson",
          serviceName: "Hair Styling",
          serviceId: 107,
          startTime: moment()
            .add(3, "days")
            .hour(15)
            .minute(0)
            .second(0)
            .toDate(),
          endTime: moment()
            .add(3, "days")
            .hour(16)
            .minute(0)
            .second(0)
            .toDate(),
          status: "pending",
          notes: "Wedding guest hairstyle",
          customerPhone: "789-012-3456",
        },
        {
          id: 8,
          customerName: "James Taylor",
          serviceName: "Scalp Treatment",
          serviceId: 108,
          startTime: moment().hour(9).minute(0).second(0).toDate(),
          endTime: moment().hour(10).minute(0).second(0).toDate(),
          status: "confirmed",
          notes: "Experiencing dry scalp",
          customerPhone: "890-123-4567",
        },
      ];

      setBookings(mockBookings);
      setFilteredBookings(mockBookings);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter bookings based on date and status
  useEffect(() => {
    if (bookings.length === 0) return;

    let filtered = [...bookings];
    const today = moment().startOf("day");
    const tomorrow = moment().add(1, "days").startOf("day");
    const weekStart = moment().startOf("week");
    const weekEnd = moment().endOf("week");
    const monthStart = moment().startOf("month");
    const monthEnd = moment().endOf("month");

    switch (dateFilter) {
      case "today":
        filtered = filtered.filter((booking) =>
          moment(booking.startTime).isSame(today, "day")
        );
        break;
      case "tomorrow":
        filtered = filtered.filter((booking) =>
          moment(booking.startTime).isSame(tomorrow, "day")
        );
        break;
      case "thisWeek":
        filtered = filtered.filter((booking) =>
          moment(booking.startTime).isBetween(weekStart, weekEnd, "day", "[]")
        );
        break;
      case "thisMonth":
        filtered = filtered.filter((booking) =>
          moment(booking.startTime).isBetween(monthStart, monthEnd, "day", "[]")
        );
        break;
      case "custom":
        const customStart = moment(customDateRange.start).startOf("day");
        const customEnd = moment(customDateRange.end).endOf("day");
        filtered = filtered.filter((booking) =>
          moment(booking.startTime).isBetween(
            customStart,
            customEnd,
            "day",
            "[]"
          )
        );
        break;
      default:
        break;
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((booking) => booking.status === statusFilter);
    }

    setFilteredBookings(filtered);
  }, [bookings, dateFilter, statusFilter, customDateRange]);

  // Initialize Three.js animation (Snowfall)
  useEffect(() => {
    if (!threeCanvasRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / 150,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({
      canvas: threeCanvasRef.current,
      alpha: true,
      antialias: true,
    });

    renderer.setSize(window.innerWidth, 150);
    renderer.setClearColor(0x000000, 0);

    // Snow particles
    const snowCount = 1000;
    const snowGeometry = new THREE.BufferGeometry();
    const snowPositions = new Float32Array(snowCount * 3);
    const snowVelocities = new Float32Array(snowCount * 3); // Velocity for each snowflake

    // Initialize snowflake positions and velocities
    for (let i = 0; i < snowCount; i++) {
      snowPositions[i * 3] = (Math.random() - 0.5) * 20; // x
      snowPositions[i * 3 + 1] = Math.random() * 10; // y (start above canvas)
      snowPositions[i * 3 + 2] = (Math.random() - 0.5) * 20; // z

      snowVelocities[i * 3] = (Math.random() - 0.5) * 0.02; // x velocity (wind)
      snowVelocities[i * 3 + 1] = -Math.random() * 0.05 - 0.05; // y velocity (falling)
      snowVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02; // z velocity
    }

    snowGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(snowPositions, 3)
    );

    const snowMaterial = new THREE.PointsMaterial({
      size: 0.05,
      color: 0xffffff, // White snowflakes
      transparent: true,
      opacity: 0.8,
    });

    const snowMesh = new THREE.Points(snowGeometry, snowMaterial);
    scene.add(snowMesh);

    // Camera positioning
    camera.position.z = 5;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Update snowflake positions
      const positions = snowMesh.geometry.attributes.position.array;
      for (let i = 0; i < snowCount; i++) {
        positions[i * 3] += snowVelocities[i * 3]; // Update x
        positions[i * 3 + 1] += snowVelocities[i * 3 + 1]; // Update y
        positions[i * 3 + 2] += snowVelocities[i * 3 + 2]; // Update z

        // Reset snowflake to top if it falls below canvas
        if (positions[i * 3 + 1] < -5) {
          positions[i * 3] = (Math.random() - 0.5) * 20; // Reset x
          positions[i * 3 + 1] = 10; // Reset y to top
          positions[i * 3 + 2] = (Math.random() - 0.5) * 20; // Reset z
        }
      }

      snowMesh.geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / 150;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, 150);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      snowGeometry.dispose();
      snowMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  // Handle booking status change
  const handleStatusChange = (bookingId, newStatus) => {
    const updatedBookings = bookings.map((booking) =>
      booking.id === bookingId ? { ...booking, status: newStatus } : booking
    );
    setBookings(updatedBookings);
  };

  // Format calendar events for react-big-calendar
  const calendarEvents = filteredBookings.map((booking) => ({
    id: booking.id,
    title: `${booking.customerName} - ${booking.serviceName}`,
    start: booking.startTime,
    end: booking.endTime,
    status: booking.status,
  }));

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500";
      case "pending":
        return "bg-orange-500";
      case "canceled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // Calendar event style renderer
  const eventStyleGetter = (event) => {
    let style = {
      borderRadius: "4px",
      opacity: 0.95,
      color: "white",
      border: "0px",
      display: "block",
    };

    switch (event.status) {
      case "confirmed":
        style.backgroundColor = "#059669";
        break;
      case "pending":
        style.backgroundColor = "#F97316";
        break;
      case "canceled":
        style.backgroundColor = "#EF4444";
        break;
      default:
        style.backgroundColor = "#6B7280";
    }

    return { style };
  };

  return (
    <div className="p-4 min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* 3D Background Effect */}
      <canvas
        ref={threeCanvasRef}
        className="absolute top-0 left-0 w-full h-40 opacity-60 pointer-events-none"
      />

      {/* Page Header */}
      <div className="relative z-10 mb-8 text-center">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-500">
          Staff Dashboard
        </h1>
        <p className="text-gray-400 mt-2">
          Manage your appointments and schedule
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          {
            title: "Today's Bookings",
            count: bookings.filter((b) =>
              moment(b.startTime).isSame(moment(), "day")
            ).length,
            icon: "clock",
            color: "from-orange-600 to-orange-500",
          },
          {
            title: "Pending Approval",
            count: bookings.filter((b) => b.status === "pending").length,
            icon: "hourglass",
            color: "from-yellow-600 to-yellow-500",
          },
          {
            title: "Confirmed",
            count: bookings.filter((b) => b.status === "confirmed").length,
            icon: "check",
            color: "from-green-600 to-green-500",
          },
          {
            title: "Canceled",
            count: bookings.filter((b) => b.status === "canceled").length,
            icon: "x",
            color: "from-red-600 to-red-500",
          },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="bg-gray-800 rounded-lg p-4 shadow-lg backdrop-blur-sm bg-opacity-80 border border-gray-700"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.count}</p>
              </div>
              <div
                className={`bg-gradient-to-br ${stat.color} rounded-full p-3 text-white shadow-lg`}
              >
                {stat.icon === "clock" && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
                {stat.icon === "hourglass" && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
                {stat.icon === "check" && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
                {stat.icon === "x" && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Controls */}
      <div className="mb-6 bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Date Filter
            </label>
            <select
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="tomorrow">Tomorrow</option>
              <option value="thisWeek">This Week</option>
              <option value="thisMonth">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {dateFilter === "custom" && (
            <>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={customDateRange.start}
                  onChange={(e) =>
                    setCustomDateRange({
                      ...customDateRange,
                      start: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={customDateRange.end}
                  onChange={(e) =>
                    setCustomDateRange({
                      ...customDateRange,
                      end: e.target.value,
                    })
                  }
                />
              </div>
            </>
          )}

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Status
            </label>
            <select
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>

          <div className="flex-1 lg:flex-none lg:self-end">
            <div className="flex w-full space-x-2">
              <button
                className={`flex-1 px-4 py-2 rounded-md focus:outline-none transition-colors ${
                  view === "table"
                    ? "bg-orange-600 text-white"
                    : "bg-gray-700 text-gray-200 hover:bg-gray-600"
                }`}
                onClick={() => setView("table")}
              >
                <span className="flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Table
                </span>
              </button>
              <button
                className={`flex-1 px-4 py-2 rounded-md focus:outline-none transition-colors ${
                  view === "calendar"
                    ? "bg-orange-600 text-white"
                    : "bg-gray-700 text-gray-200 hover:bg-gray-600"
                }`}
                onClick={() => setView("calendar")}
              >
                <span className="flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Calendar
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center p-12">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Table View */}
          {view === "table" && (
            <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
              {filteredBookings.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-900">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                        >
                          Customer
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                        >
                          Service
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                        >
                          Date & Time
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                        >
                          Notes
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                      {filteredBookings.map((booking) => (
                        <tr
                          key={booking.id}
                          className="hover:bg-gray-750 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="ml-2">
                                <div className="text-sm font-medium text-white">
                                  {booking.customerName}
                                </div>
                                <div className="text-sm text-gray-400">
                                  {booking.customerPhone}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-white">
                              {booking.serviceName}
                            </div>
                            <div className="text-xs text-gray-400">
                              {moment(booking.endTime).diff(
                                moment(booking.startTime),
                                "minutes"
                              )}{" "}
                              min
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-white">
                              {moment(booking.startTime).format("MMM D, YYYY")}
                            </div>
                            <div className="text-xs text-gray-400">
                              {moment(booking.startTime).format("h:mm A")} -{" "}
                              {moment(booking.endTime).format("h:mm A")}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                booking.status
                              )} text-white`}
                            >
                              {booking.status.charAt(0).toUpperCase() +
                                booking.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-300 max-w-xs truncate">
                              {booking.notes || "No notes"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {booking.status === "pending" && (
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() =>
                                    handleStatusChange(booking.id, "confirmed")
                                  }
                                  className="text-green-400 hover:text-green-600 transition-colors"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                </button>
                                <button
                                  onClick={() =>
                                    handleStatusChange(booking.id, "canceled")
                                  }
                                  className="text-red-400 hover:text-red-600 transition-colors"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                </button>
                              </div>
                            )}
                            {booking.status === "confirmed" && (
                              <button
                                onClick={() =>
                                  handleStatusChange(booking.id, "canceled")
                                }
                                className="text-red-400 hover:text-red-600 transition-colors"
                              >
                                Cancel
                              </button>
                            )}
                            {booking.status === "canceled" && (
                              <button
                                onClick={() =>
                                  handleStatusChange(booking.id, "confirmed")
                                }
                                className="text-orange-400 hover:text-orange-600 transition-colors"
                              >
                                Restore
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-gray-500 mx-auto mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-300">
                    No bookings found
                  </h3>
                  <p className="text-gray-500 mt-1">
                    Try adjusting your filters to see more results.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Calendar View */}
          {view === "calendar" && (
            <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-4 h-screen max-h-[600px]">
              <div className="h-full">
                <Calendar
                  localizer={localizer}
                  events={calendarEvents}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: "100%" }}
                  eventPropGetter={eventStyleGetter}
                  views={["month", "week", "day"]}
                  defaultView="week"
                  formats={{
                    timeGutterFormat: "h:mm A",
                    eventTimeRangeFormat: ({ start, end }) => {
                      return `${moment(start).format("h:mm A")} - ${moment(
                        end
                      ).format("h:mm A")}`;
                    },
                  }}
                  className="salon-calendar"
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* Custom styles for react-big-calendar */}
      <style jsx>{`
        :global(.salon-calendar) {
          background-color: #1f2937;
          color: white;
          border-radius: 0.5rem;
        }
        :global(.salon-calendar .rbc-header) {
          background-color: #111827;
          color: #9ca3af;
          padding: 8px;
          border-bottom: 1px solid #374151;
          text-transform: uppercase;
          font-size: 0.75rem;
          font-weight: 600;
        }
        :global(.salon-calendar .rbc-time-header) {
          background-color: #111827;
          border-bottom: 1px solid #374151;
        }
        :global(.salon-calendar .rbc-time-content) {
          background-color: #1f2937;
          border: none;
        }
        :global(.salon-calendar .rbc-timeslot-group) {
          background-color: #1f2937;
          border-bottom: 1px solid #374151;
        }
        :global(.salon-calendar .rbc-time-slot) {
          color: #9ca3af;
          font-size: 0.75rem;
        }
        :global(.salon-calendar .rbc-day-bg) {
          background-color: #1f2937;
          border-left: 1px solid #374151;
        }
        :global(.salon-calendar .rbc-day-bg.rbc-today) {
          background-color: #374151;
        }
        :global(.salon-calendar .rbc-event) {
          padding: 4px 8px;
          font-size: 0.875rem;
          border-radius: 4px;
        }
        :global(.salon-calendar .rbc-month-view) {
          background-color: #1f2937;
        }
        :global(.salon-calendar .rbc-month-row) {
          border-top: 1px solid #374151;
        }
        :global(.salon-calendar .rbc-date-cell) {
          color: #d1d5db;
          padding: 8px;
        }
        :global(.salon-calendar .rbc-off-range) {
          color: #6b7280;
        }
        :global(.salon-calendar .rbc-off-range-bg) {
          background-color: #111827;
        }
        :global(.salon-calendar .rbc-today) {
          background-color: #374151;
        }
        :global(.salon-calendar .rbc-btn-group button) {
          background-color: #374151;
          color: #d1d5db;
          border: 1px solid #4b5563;
        }
        :global(.salon-calendar .rbc-btn-group button:hover) {
          background-color: #4b5563;
          color: #ffffff;
        }
        :global(.salon-calendar .rbc-btn-group button.rbc-active) {
          background-color: #f97316;
          color: #ffffff;
          border-color: #f97316;
        }
      `}</style>
    </div>
  );
};

export default Homestaff;
