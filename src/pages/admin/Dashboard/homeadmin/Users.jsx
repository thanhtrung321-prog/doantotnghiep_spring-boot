import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: "created_at",
    direction: "desc",
  });

  const threeCanvasRef = useRef(null);

  // Mock data - replace with your actual API call
  useEffect(() => {
    setTimeout(() => {
      const mockUsers = [
        {
          id: 1,
          username: "john_doe",
          full_name: "John Doe",
          email: "john@example.com",
          phone: "123-456-7890",
          role: "admin",
          created_at: "2024-12-01T10:00:00",
          updated_at: "2025-01-15T08:30:00",
        },
        {
          id: 2,
          username: "jane_smith",
          full_name: "Jane Smith",
          email: "jane@example.com",
          phone: "234-567-8901",
          role: "staff",
          created_at: "2025-01-05T14:20:00",
          updated_at: "2025-02-10T11:45:00",
        },
        {
          id: 3,
          username: "bob_johnson",
          full_name: "Bob Johnson",
          email: "bob@example.com",
          phone: "345-678-9012",
          role: "user",
          created_at: "2025-02-12T09:15:00",
          updated_at: "2025-03-01T16:20:00",
        },
        {
          id: 4,
          username: "sarah_lee",
          full_name: "Sarah Lee",
          email: "sarah@example.com",
          phone: "456-789-0123",
          role: "staff",
          created_at: "2025-01-20T11:30:00",
          updated_at: "2025-02-28T13:10:00",
        },
        {
          id: 5,
          username: "mike_brown",
          full_name: "Mike Brown",
          email: "mike@example.com",
          phone: "567-890-1234",
          role: "user",
          created_at: "2025-02-15T16:45:00",
          updated_at: "2025-03-05T10:30:00",
        },
        {
          id: 6,
          username: "emily_davis",
          full_name: "Emily Davis",
          email: "emily@example.com",
          phone: "678-901-2345",
          role: "staff",
          created_at: "2025-01-10T08:20:00",
          updated_at: "2025-02-20T15:40:00",
        },
        {
          id: 7,
          username: "alex_wilson",
          full_name: "Alex Wilson",
          email: "alex@example.com",
          phone: "789-012-3456",
          role: "admin",
          created_at: "2024-12-15T13:50:00",
          updated_at: "2025-01-25T09:15:00",
        },
        {
          id: 8,
          username: "lisa_taylor",
          full_name: "Lisa Taylor",
          email: "lisa@example.com",
          phone: "890-123-4567",
          role: "user",
          created_at: "2025-02-01T10:10:00",
          updated_at: "2025-03-10T14:25:00",
        },
      ];

      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filter users based on search and role
  useEffect(() => {
    let result = [...users];

    if (selectedRole !== "all") {
      result = result.filter((user) => user.role === selectedRole);
    }

    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      result = result.filter(
        (user) =>
          user.username.toLowerCase().includes(lowercasedSearch) ||
          user.full_name.toLowerCase().includes(lowercasedSearch) ||
          user.email.toLowerCase().includes(lowercasedSearch) ||
          user.phone.includes(searchTerm)
      );
    }

    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredUsers(result);
  }, [users, searchTerm, selectedRole, sortConfig]);

  // Initialize Three.js animation
  useEffect(() => {
    if (!threeCanvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / 300,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({
      canvas: threeCanvasRef.current,
      alpha: true,
      antialias: true,
    });

    renderer.setSize(window.innerWidth, 300);
    renderer.setClearColor(0x000000, 0);

    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 1500;

    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color(0xff6b00); // Orange
    const color2 = new THREE.Color(0xff3300); // Red-orange

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 5;

      const blendFactor = Math.random();
      const blendedColor = color1.clone().lerp(color2, blendFactor);

      colors[i * 3] = blendedColor.r;
      colors[i * 3 + 1] = blendedColor.g;
      colors[i * 3 + 2] = blendedColor.b;
    }

    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    particlesGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(colors, 3)
    );

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });

    const particlesMesh = new THREE.Points(
      particlesGeometry,
      particlesMaterial
    );
    scene.add(particlesMesh);

    camera.position.z = 5;

    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (event) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const animate = () => {
      requestAnimationFrame(animate);
      particlesMesh.rotation.x += 0.001;
      particlesMesh.rotation.y += 0.002;
      particlesMesh.rotation.x += mouseY * 0.001;
      particlesMesh.rotation.y += mouseX * 0.001;
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / 300;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, 300);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  // Sorting functions
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortDirectionIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  // Handle user selection
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Role badge color
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-500";
      case "staff":
        return "bg-orange-400";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Main Content Container */}
      <div className="relative z-10 container mx-auto px-4 py-6">
        {/* Page Title */}
        <div className="relative">
          {/* Three.js Canvas Background */}
          <canvas
            ref={threeCanvasRef}
            className="absolute top-0 left-0 w-full h-full opacity-50 pointer-events-none z-0"
          />

          {/* Nội dung hiển thị trên nền */}
          <div className="relative z-10 mb-8 text-center">
            <h2 className="text-3xl font-bold mb-2 text-orange-500">
              <span className="text-amber-50">Quản Lý</span> Người dùng
            </h2>
            <p className="text-gray-400">Quản lý tất cả người dùng của bạn</p>
          </div>
        </div>

        {/* Controls Section */}
        <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-1/3">
            <input
              type="text"
              placeholder="Search users..."
              className="w-full px-4 py-2 pl-10 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <div className="w-full md:w-1/4">
            <select
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="all">Tất cả quyền</option>
              <option value="admin">Quản Trị Viên</option>
              <option value="staff">Nhân viên</option>
              <option value="user">Người Dùng </option>
            </select>
          </div>

          <button className="w-full md:w-auto px-6 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg font-medium transition-all flex items-center justify-center gap-2 cursor-pointer">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Thêm người dùng mới
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 rounded-lg border border-gray-800">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm">Total Users</p>
                <p className="text-2xl font-bold">
                  {users.filter((u) => u.role === "user").length}
                </p>
              </div>
              <div className="bg-blue-500/20 p-3 rounded-full">
                <svg
                  className="w-6 h-6 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 rounded-lg border border-gray-800">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm">Staff Members</p>
                <p className="text-2xl font-bold">
                  {users.filter((u) => u.role === "staff").length}
                </p>
              </div>
              <div className="bg-orange-500/20 p-3 rounded-full">
                <svg
                  className="w-6 h-6 text-orange-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 rounded-lg border border-gray-800">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm">Administrators</p>
                <p className="text-2xl font-bold">
                  {users.filter((u) => u.role === "admin").length}
                </p>
              </div>
              <div className="bg-red-500/20 p-3 rounded-full">
                <svg
                  className="w-6 h-6 text-red-500"
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
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-800">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-800 text-left">
                    <th
                      className="px-4 py-3 cursor-pointer hover:bg-gray-700"
                      onClick={() => requestSort("id")}
                    >
                      ID {getSortDirectionIndicator("id")}
                    </th>
                    <th
                      className="px-4 py-3 cursor-pointer hover:bg-gray-700"
                      onClick={() => requestSort("username")}
                    >
                      Username {getSortDirectionIndicator("username")}
                    </th>
                    <th
                      className="px-4 py-3 cursor-pointer hover:bg-gray-700"
                      onClick={() => requestSort("full_name")}
                    >
                      Full Name {getSortDirectionIndicator("full_name")}
                    </th>
                    <th
                      className="px-4 py-3 cursor-pointer hover:bg-gray-700"
                      onClick={() => requestSort("email")}
                    >
                      Email {getSortDirectionIndicator("email")}
                    </th>
                    <th
                      className="px-4 py-3 cursor-pointer hover:bg-gray-700"
                      onClick={() => requestSort("phone")}
                    >
                      Phone {getSortDirectionIndicator("phone")}
                    </th>
                    <th
                      className="px-4 py-3 cursor-pointer hover:bg-gray-700"
                      onClick={() => requestSort("role")}
                    >
                      Role {getSortDirectionIndicator("role")}
                    </th>
                    <th
                      className="px-4 py-3 cursor-pointer hover:bg-gray-700"
                      onClick={() => requestSort("created_at")}
                    >
                      Created {getSortDirectionIndicator("created_at")}
                    </th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan="8"
                        className="px-4 py-8 text-center text-gray-400"
                      >
                        No users found matching your criteria
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user, index) => (
                      <tr
                        key={user.id}
                        className={`hover:bg-gray-800 ${
                          index % 2 === 0 ? "bg-gray-850" : ""
                        } transition-colors`}
                      >
                        <td className="px-4 py-3">{user.id}</td>
                        <td className="px-4 py-3">{user.username}</td>
                        <td className="px-4 py-3 font-medium">
                          {user.full_name}
                        </td>
                        <td className="px-4 py-3 text-gray-300">
                          {user.email}
                        </td>
                        <td className="px-4 py-3">{user.phone}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                              user.role
                            )}`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400">
                          {formatDate(user.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => handleUserSelect(user)}
                              className="p-1.5 bg-blue-500 bg-opacity-20 rounded hover:bg-opacity-30 transition-all"
                              title="View Details"
                            >
                              <svg
                                className="w-4 h-4 text-blue-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                            </button>
                            <button
                              className="p-1.5 bg-orange-500 bg-opacity-20 rounded hover:bg-opacity-30 transition-all"
                              title="Edit User"
                            >
                              <svg
                                className="w-4 h-4 text-orange-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                            <button
                              className="p-1.5 bg-red-500 bg-opacity-20 rounded hover:bg-opacity-30 transition-all"
                              title="Delete User"
                            >
                              <svg
                                className="w-4 h-4 text-red-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-400">
            Showing{" "}
            <span className="font-medium text-white">
              {filteredUsers.length}
            </span>{" "}
            of <span className="font-medium text-white">{users.length}</span>{" "}
            users
          </div>

          <div className="flex space-x-1">
            <button className="px-3 py-1 bg-gray-800 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              Previous
            </button>
            <button className="px-3 py-1 bg-orange-600 rounded-md">1</button>
            <button className="px-3 py-1 bg-gray-800 rounded-md hover:bg-gray-700 transition-all">
              2
            </button>
            <button className="px-3 py-1 bg-gray-800 rounded-md hover:bg-gray-700 transition-all">
              3
            </button>
            <button className="px-3 py-1 bg-gray-800 rounded-md hover:bg-gray-700 transition-all">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-gray-900 w-full max-w-lg rounded-xl overflow-hidden shadow-2xl border border-gray-800 animate-fade-in">
            <div className="flex justify-between items-center border-b border-gray-800 p-4">
              <h3 className="text-xl font-bold">User Details</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-gray-800 rounded-full transition-all"
              >
                <svg
                  className="w-6 h-6"
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

            <div className="p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-3xl font-bold mb-3">
                  {selectedUser.full_name
                    .split(" ")
                    .map((name) => name[0])
                    .join("")}
                </div>
                <h3 className="text-xl font-bold">{selectedUser.full_name}</h3>
                <span
                  className={`mt-1 px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                    selectedUser.role
                  )}`}
                >
                  {selectedUser.role}
                </span>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Username</p>
                    <p className="font-medium">{selectedUser.username}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">User ID</p>
                    <p className="font-medium">{selectedUser.id}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-400">Email Address</p>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-400">Phone Number</p>
                  <p className="font-medium">{selectedUser.phone}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Created At</p>
                    <p className="font-medium">
                      {formatDate(selectedUser.created_at)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Last Updated</p>
                    <p className="font-medium">
                      {formatDate(selectedUser.updated_at)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex space-x-3">
                <button className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg font-medium transition-all">
                  Edit User
                </button>
                <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-all">
                  Reset Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
