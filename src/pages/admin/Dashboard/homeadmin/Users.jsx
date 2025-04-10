import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../../api/apiadmin/usermannager";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    role: "USER",
    password: "",
  });

  // State cho các modal thông báo
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] =
    useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [userIdToDelete, setUserIdToDelete] = useState(null);

  const threeCanvasRef = useRef(null);

  // Lấy danh sách người dùng từ API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const data = await getAllUsers();
        setUsers(data);
        setFilteredUsers(data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        setModalMessage("Failed to fetch users. Please try again later.");
        setIsErrorModalOpen(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Filter và sort người dùng
  useEffect(() => {
    let result = [...users];

    if (selectedRole !== "all") {
      result = result.filter(
        (user) => user.role.toLowerCase() === selectedRole
      );
    }

    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      result = result.filter(
        (user) =>
          user.username.toLowerCase().includes(lowercasedSearch) ||
          user.fullName.toLowerCase().includes(lowercasedSearch) ||
          user.email.toLowerCase().includes(lowercasedSearch) ||
          user.phone.includes(searchTerm)
      );
    }

    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredUsers(result);
  }, [users, searchTerm, selectedRole, sortConfig]);

  // Three.js animation (giữ nguyên)
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

    const color1 = new THREE.Color(0xff6b00);
    const color2 = new THREE.Color(0xff3300);

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
    switch (role.toLowerCase()) {
      case "admin":
        return "bg-red-500";
      case "staff":
        return "bg-orange-400";
      default:
        return "bg-blue-500";
    }
  };

  // Handle add user
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const createdUser = await createUser(newUserData);
      setUsers((prev) => [...prev, createdUser]);
      setIsAddModalOpen(false);
      setNewUserData({
        fullName: "",
        username: "",
        email: "",
        phone: "",
        role: "USER",
        password: "",
      });
      setModalMessage("User added successfully!");
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error("Failed to add user:", error);
      setModalMessage("Failed to add user. Please try again.");
      setIsErrorModalOpen(true);
    }
  };

  // Handle update user
  const handleUpdateUser = async () => {
    try {
      const updatedUser = await updateUser(selectedUser.id, selectedUser);
      setUsers((prev) =>
        prev.map((user) => (user.id === updatedUser.id ? updatedUser : user))
      );
      setIsModalOpen(false);
      setModalMessage("User updated successfully!");
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error("Failed to update user:", error);
      setModalMessage("Failed to update user. Please try again.");
      setIsErrorModalOpen(true);
    }
  };

  // Handle delete user
  const handleDeleteUser = (id) => {
    setUserIdToDelete(id);
    setIsConfirmDeleteModalOpen(true);
  };

  const confirmDeleteUser = async () => {
    try {
      await deleteUser(userIdToDelete);
      setUsers((prev) => prev.filter((user) => user.id !== userIdToDelete));
      setIsConfirmDeleteModalOpen(false);
      setModalMessage("User deleted successfully!");
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error("Failed to delete user:", error);
      setIsConfirmDeleteModalOpen(false);
      setModalMessage("Failed to delete user. Please try again.");
      setIsErrorModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Main Content Container */}
      <div className="relative z-10 container mx-auto px-4 py-6">
        {/* Page Title */}
        <div className="relative">
          <canvas
            ref={threeCanvasRef}
            className="absolute top-0 left-0 w-full h-full opacity-50 pointer-events-none z-0"
          />
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
              <option value="user">Người Dùng</option>
            </select>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full md:w-auto px-6 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg font-medium transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
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
                  {users.filter((u) => u.role.toLowerCase() === "user").length}
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
                  {users.filter((u) => u.role.toLowerCase() === "staff").length}
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
                  {users.filter((u) => u.role.toLowerCase() === "admin").length}
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
                      onClick={() => requestSort("fullName")}
                    >
                      Full Name {getSortDirectionIndicator("fullName")}
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
                      onClick={() => requestSort("createdAt")}
                    >
                      Created {getSortDirectionIndicator("createdAt")}
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
                          {user.fullName}
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
                          {formatDate(user.createdAt)}
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
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleUserSelect(user)}
                              className="p-1.5 bg-orange-500 bg-opacity-20 rounded hover:bg-opacity-30 transition-all"
                              title="Edit User"
                            >
                              <svg
                                className="w-4 h-4 text-orange-500"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-1.5 bg-red-500 bg-opacity-20 rounded hover:bg-opacity-30 transition-all"
                              title="Delete User"
                            >
                              <svg
                                className="w-4 h-4 text-red-500"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
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

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-gray-900 w-full max-w-lg rounded-xl overflow-hidden shadow-2xl border border-gray-800 animate-fade-in">
            <div className="flex justify-between items-center border-b border-gray-800 p-4">
              <h3 className="text-xl font-bold">Add New User</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
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
            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div>
                <label className="text-sm text-gray-400">Full Name</label>
                <input
                  type="text"
                  value={newUserData.fullName}
                  onChange={(e) =>
                    setNewUserData({ ...newUserData, fullName: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">Username</label>
                <input
                  type="text"
                  value={newUserData.username}
                  onChange={(e) =>
                    setNewUserData({ ...newUserData, username: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">Email</label>
                <input
                  type="email"
                  value={newUserData.email}
                  onChange={(e) =>
                    setNewUserData({ ...newUserData, email: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">Phone</label>
                <input
                  type="text"
                  value={newUserData.phone}
                  onChange={(e) =>
                    setNewUserData({ ...newUserData, phone: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">Role</label>
                <select
                  value={newUserData.role}
                  onChange={(e) =>
                    setNewUserData({ ...newUserData, role: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="USER">Người Dùng</option>
                  <option value="STAFF">Nhân viên</option>
                  <option value="ADMIN">Quản Trị Viên</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400">Password</label>
                <input
                  type="password"
                  value={newUserData.password}
                  onChange={(e) =>
                    setNewUserData({ ...newUserData, password: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg font-medium transition-all"
              >
                Add User
              </button>
            </form>
          </div>
        </div>
      )}

      {/* User Details/Edit Modal */}
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
                  {selectedUser.fullName
                    .split(" ")
                    .map((name) => name[0])
                    .join("")}
                </div>
                <input
                  type="text"
                  value={selectedUser.fullName}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      fullName: e.target.value,
                    })
                  }
                  className="text-xl font-bold bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-center"
                />
                <select
                  value={selectedUser.role}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, role: e.target.value })
                  }
                  className={`mt-1 px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                    selectedUser.role
                  )} bg-gray-800 border border-gray-700`}
                >
                  <option value="USER">USER</option>
                  <option value="STAFF">STAFF</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Username</p>
                    <input
                      type="text"
                      value={selectedUser.username}
                      onChange={(e) =>
                        setSelectedUser({
                          ...selectedUser,
                          username: e.target.value,
                        })
                      }
                      className="font-medium bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 w-full"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">User ID</p>
                    <p className="font-medium">{selectedUser.id}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-400">Email Address</p>
                  <input
                    type="email"
                    value={selectedUser.email}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        email: e.target.value,
                      })
                    }
                    className="font-medium bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 w-full"
                  />
                </div>

                <div>
                  <p className="text-sm text-gray-400">Phone Number</p>
                  <input
                    type="text"
                    value={selectedUser.phone}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        phone: e.target.value,
                      })
                    }
                    className="font-medium bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 w-full"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Created At</p>
                    <p className="font-medium">
                      {formatDate(selectedUser.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Last Updated</p>
                    <p className="font-medium">
                      {formatDate(selectedUser.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex space-x-3">
                <button
                  onClick={handleUpdateUser}
                  className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg font-medium transition-all"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-gray-900 w-full max-w-md rounded-xl shadow-2xl border border-gray-800 p-6 animate-bounce-in">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-green-500/20 p-3 rounded-full">
                <svg
                  className="w-8 h-8 text-green-500"
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
              </div>
            </div>
            <h3 className="text-xl font-bold text-center text-green-400">
              Success!
            </h3>
            <p className="text-gray-300 text-center mt-2">{modalMessage}</p>
            <button
              onClick={() => setIsSuccessModalOpen(false)}
              className="w-full mt-6 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-all"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {isErrorModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-gray-900 w-full max-w-md rounded-xl shadow-2xl border border-gray-800 p-6 animate-bounce-in">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-red-500/20 p-3 rounded-full">
                <svg
                  className="w-8 h-8 text-red-500"
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
              </div>
            </div>
            <h3 className="text-xl font-bold text-center text-red-400">
              Error!
            </h3>
            <p className="text-gray-300 text-center mt-2">{modalMessage}</p>
            <button
              onClick={() => setIsErrorModalOpen(false)}
              className="w-full mt-6 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-all"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {isConfirmDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-gray-900 w-full max-w-md rounded-xl shadow-2xl border border-gray-800 p-6 animate-bounce-in">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-yellow-500/20 p-3 rounded-full">
                <svg
                  className="w-8 h-8 text-yellow-500"
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
              </div>
            </div>
            <h3 className="text-xl font-bold text-center text-yellow-400">
              Confirm Delete
            </h3>
            <p className="text-gray-300 text-center mt-2">
              Bạn có muốn xóa tài khoản này không ?
            </p>
            <div className="mt-6 flex space-x-4">
              <button
                onClick={confirmDeleteUser}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-all"
              >
                Có
              </button>
              <button
                onClick={() => setIsConfirmDeleteModalOpen(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-all"
              >
                trở lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
