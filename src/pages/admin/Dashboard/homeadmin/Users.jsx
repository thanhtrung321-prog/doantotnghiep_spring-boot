import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import AOS from "aos";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "aos/dist/aos.css";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getAllSalons,
} from "../../api/apiadmin/usermannager";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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
    salonId: null,
  });
  const [salons, setSalons] = useState([]);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] =
    useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [roleModalUsers, setRoleModalUsers] = useState([]);
  const [roleModalTitle, setRoleModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [userIdToDelete, setUserIdToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;
  const titleRef = useRef(null);
  const modalRef = useRef(null);
  const tableRef = useRef(null);
  const tableRowsRef = useRef([]);
  const noUsersMessageRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem("user")) || {};

  // Define pagination variables
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  useEffect(() => {
    AOS.init({
      duration: 500,
      easing: "ease-out",
      once: true,
    });
  }, []);

  useEffect(() => {
    if (titleRef.current) {
      const letters = titleRef.current.querySelectorAll(".letter");
      gsap.fromTo(
        letters,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.05,
          ease: "power2.out",
        }
      );
    }
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const data = await getAllUsers();
        setUsers(data);
        setFilteredUsers(data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        setModalMessage(
          "Không thể tải danh sách người dùng. Vui lòng thử lại."
        );
        setIsErrorModalOpen(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (isAddModalOpen || isEditModalOpen) {
      const fetchSalons = async () => {
        try {
          const data = await getAllSalons();
          setSalons(data);
        } catch (error) {
          console.error("Failed to fetch salons:", error);
          setModalMessage("Không thể tải danh sách salon. Vui lòng thử lại.");
          setIsErrorModalOpen(true);
        }
      };
      fetchSalons();
    }
  }, [isAddModalOpen, isEditModalOpen]);

  useEffect(() => {
    const isAnyModalOpen =
      isViewModalOpen ||
      isEditModalOpen ||
      isAddModalOpen ||
      isSuccessModalOpen ||
      isErrorModalOpen ||
      isConfirmDeleteModalOpen ||
      isRoleModalOpen;

    if (isAnyModalOpen && modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" }
      );
    }
  }, [
    isViewModalOpen,
    isEditModalOpen,
    isAddModalOpen,
    isSuccessModalOpen,
    isErrorModalOpen,
    isConfirmDeleteModalOpen,
    isRoleModalOpen,
  ]);

  useEffect(() => {
    if (currentUsers.length === 0 && noUsersMessageRef.current && !isLoading) {
      gsap.fromTo(
        noUsersMessageRef.current,
        { opacity: 0, scale: 0.8, y: 20 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.6,
          ease: "elastic.out(1, 0.3)",
        }
      );
    }
  }, [currentUsers, isLoading]);

  useEffect(() => {
    if (
      tableRowsRef.current.length > 0 &&
      tableRef.current &&
      currentUsers.length > 0
    ) {
      gsap.fromTo(
        tableRowsRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out",
        }
      );
    }
  }, [filteredUsers, currentPage, currentUsers]);

  useEffect(() => {
    let result = [...users];

    if (selectedRole !== "all") {
      result = result.filter(
        (user) => user.role.toLowerCase() === selectedRole.toLowerCase()
      );
    }

    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      result = result.filter(
        (user) =>
          user.username.toLowerCase().includes(lowercasedSearch) ||
          (user.fullName &&
            user.fullName.toLowerCase().includes(lowercasedSearch)) ||
          user.email.toLowerCase().includes(lowercasedSearch) ||
          user.phone.includes(searchTerm)
      );
    }

    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key] || "";
        const bValue = b[sortConfig.key] || "";
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    setFilteredUsers(result);
    setCurrentPage(1);
  }, [users, searchTerm, selectedRole, sortConfig]);

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

  const handleUserSelect = (user) => {
    setSelectedUser({ ...user, salonId: user.salonId || null });
    setIsViewModalOpen(true);
  };

  const handleRoleCardClick = (role, title) => {
    const filtered = users.filter(
      (user) => user.role.toLowerCase() === role.toLowerCase()
    );
    setRoleModalUsers(filtered);
    setRoleModalTitle(title);
    setIsRoleModalOpen(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getRoleBadgeColor = (role) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "bg-red-600 text-white";
      case "staff":
        return "bg-orange-500 text-white";
      case "owner":
        return "bg-purple-600 text-white";
      default:
        return "bg-blue-500 text-white";
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const userDataToSend = { ...newUserData };
      if (newUserData.role !== "STAFF" && newUserData.role !== "OWNER") {
        userDataToSend.salonId = null;
      }
      const createdUser = await createUser(userDataToSend);
      setUsers((prev) => [...prev, createdUser]);
      setIsAddModalOpen(false);
      setNewUserData({
        fullName: "",
        username: "",
        email: "",
        phone: "",
        role: "USER",
        password: "",
        salonId: null,
      });
      setModalMessage("Thêm người dùng thành công!");
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error("Failed to add user:", error);
      setModalMessage("Thêm người dùng thất bại. Vui lòng thử lại.");
      setIsErrorModalOpen(true);
    }
  };

  const handleUpdateUser = async () => {
    if (
      currentUser.role.toLowerCase() === "admin" &&
      selectedUser.role.toLowerCase() === "admin"
    ) {
      setModalMessage("Quản trị viên không thể chỉnh sửa quản trị viên khác.");
      setIsErrorModalOpen(true);
      return;
    }

    try {
      const userDataToSend = { ...selectedUser };
      if (selectedUser.role !== "STAFF" && selectedUser.role !== "OWNER") {
        userDataToSend.salonId = null;
      }
      const updatedUser = await updateUser(selectedUser.id, userDataToSend);
      setUsers((prev) =>
        prev.map((user) => (user.id === updatedUser.id ? updatedUser : user))
      );
      setIsEditModalOpen(false);
      setIsViewModalOpen(false);
      setModalMessage("Cập nhật người dùng thành công!");
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error("Failed to update user:", error);
      setModalMessage("Cập nhật người dùng thất bại. Vui lòng thử lại.");
      setIsErrorModalOpen(true);
    }
  };

  const handleDeleteUser = (id) => {
    setUserIdToDelete(id);
    setIsConfirmDeleteModalOpen(true);
  };

  const confirmDeleteUser = async () => {
    try {
      await deleteUser(userIdToDelete);
      setUsers((prev) => prev.filter((user) => user.id !== userIdToDelete));
      setIsConfirmDeleteModalOpen(false);
      setModalMessage("Xóa người dùng thành công!");
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error("Failed to delete user:", error);
      setIsConfirmDeleteModalOpen(false);
      setModalMessage("Xóa người dùng thất bại. Vui lòng thử lại.");
      setIsErrorModalOpen(true);
    }
  };

  const canEditUser = () => {
    if (!selectedUser || !currentUser.role) return false;
    return (
      currentUser.role.toLowerCase() === "admin" &&
      selectedUser.role.toLowerCase() !== "admin"
    );
  };

  const handleButtonHover = (e) => {
    gsap.to(e.currentTarget, {
      scale: 1.1,
      duration: 0.2,
      ease: "power2.out",
    });
  };

  const handleButtonLeave = (e) => {
    gsap.to(e.currentTarget, {
      scale: 1,
      duration: 0.2,
      ease: "power2.out",
    });
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const titleText = "Quản lý người dùng";
  const titleLetters = titleText.split("").map((char, index) => (
    <span key={index} className="letter inline-block">
      {char === " " ? "\u00A0" : char}
    </span>
  ));

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="relative z-10 container mx-auto px-4 py-6">
        <div className="relative mb-8 text-center">
          <h2
            ref={titleRef}
            className="text-3xl font-bold mb-2 text-orange-500"
          >
            {titleLetters}
          </h2>
          <p className="text-gray-400">Quản lý tất cả người dùng của bạn</p>
        </div>

        <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-1/3">
            <input
              type="text"
              placeholder="Tìm kiếm người dùng..."
              className="w-full px-4 py-2 pl-10 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <i className="fas fa-search absolute left-3 top-2.5 h-5 w-5 text-gray-500"></i>
          </div>

          <div className="w-full md:w-1/4">
            <select
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
                if (tableRef.current) {
                  gsap.fromTo(
                    tableRef.current,
                    { opacity: 0.8, y: 10 },
                    { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
                  );
                }
              }}
            >
              <option value="all">Tất cả vai trò</option>
              <option value="admin">Quản trị viên</option>
              <option value="owner">Chủ salon</option>
              <option value="staff">Nhân viên</option>
              <option value="user">Người dùng</option>
            </select>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full md:w-auto px-6 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg font-medium transition-all flex items-center justify-center gap-2 cursor-pointer"
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
          >
            <i className="fas fa-plus w-5 h-5"></i>
            Thêm người dùng
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div
            className="bg-gradient-to-r from-gray-800 to-gray-700 p-4 rounded-lg border border-gray-600 cursor-pointer hover:bg-gray-700 transition-all"
            data-aos="fade-up"
            data-aos-delay="100"
            onClick={() => handleRoleCardClick("user", "Người dùng")}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-300 text-sm">Người dùng</p>
                <p className="text-2xl font-bold">
                  {users.filter((u) => u.role.toLowerCase() === "user").length}
                </p>
              </div>
              <div className="bg-blue-500 p-3 rounded-full">
                <i className="fas fa-user p-3 text-2xl text-white"></i>
              </div>
            </div>
          </div>

          <div
            className="bg-gradient-to-r from-gray-800 to-gray-700 p-4 rounded-lg border border-gray-600 cursor-pointer hover:bg-gray-700 transition-all"
            data-aos="fade-up"
            data-aos-delay="200"
            onClick={() => handleRoleCardClick("staff", "Nhân viên")}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-300 text-sm">Nhân viên</p>
                <p className="text-2xl font-bold">
                  {users.filter((u) => u.role.toLowerCase() === "staff").length}
                </p>
              </div>
              <div className="bg-orange-500 p-3 rounded-full">
                <i className="fas fa-briefcase p-3 text-2xl text-white"></i>
              </div>
            </div>
          </div>

          <div
            className="bg-gradient-to-r from-gray-800 to-gray-700 p-4 rounded-lg border border-gray-600 cursor-pointer hover:bg-gray-700 transition-all"
            data-aos="fade-up"
            data-aos-delay="300"
            onClick={() => handleRoleCardClick("admin", "Quản trị viên")}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-300 text-sm">Quản trị viên</p>
                <p className="text-2xl font-bold">
                  {users.filter((u) => u.role.toLowerCase() === "admin").length}
                </p>
              </div>
              <div className="bg-red-600 p-3 rounded-full">
                <i className="fas fa-shield-alt p-3 text-2xl text-white"></i>
              </div>
            </div>
          </div>

          <div
            className="bg-gradient-to-r from-gray-800 to-gray-700 p-4 rounded-lg border border-gray-600 cursor-pointer hover:bg-gray-700 transition-all"
            data-aos="fade-up"
            data-aos-delay="400"
            onClick={() => handleRoleCardClick("owner", "Chủ salon")}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-300 text-sm">Chủ salon</p>
                <p className="text-2xl font-bold">
                  {users.filter((u) => u.role.toLowerCase() === "owner").length}
                </p>
              </div>
              <div className="bg-purple-600 p-3 rounded-full">
                <i className="fas fa-store p-3 text-2xl text-white"></i>
              </div>
            </div>
          </div>
        </div>

        <div
          ref={tableRef}
          className="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700"
        >
          {isLoading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                <div className="h-4 bg-gray-700 rounded w-4/5"></div>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-700 text-left">
                    <th
                      className="px-4 py-3 cursor-pointer hover:bg-gray-600"
                      onClick={() => requestSort("id")}
                    >
                      ID {getSortDirectionIndicator("id")}
                    </th>
                    <th
                      className="px-4 py-3 cursor-pointer hover:bg-gray-600"
                      onClick={() => requestSort("username")}
                    >
                      Tên đăng nhập {getSortDirectionIndicator("username")}
                    </th>
                    <th
                      className="px-4 py-3 cursor-pointer hover:bg-gray-600"
                      onClick={() => requestSort("fullName")}
                    >
                      Họ và tên {getSortDirectionIndicator("fullName")}
                    </th>
                    <th
                      className="px-4 py-3 cursor-pointer hover:bg-gray-600"
                      onClick={() => requestSort("email")}
                    >
                      Email {getSortDirectionIndicator("email")}
                    </th>
                    <th
                      className="px-4 py-3 cursor-pointer hover:bg-gray-600"
                      onClick={() => requestSort("phone")}
                    >
                      Số điện thoại {getSortDirectionIndicator("phone")}
                    </th>
                    <th
                      className="px-4 py-3 cursor-pointer hover:bg-gray-600"
                      onClick={() => requestSort("role")}
                    >
                      Vai trò {getSortDirectionIndicator("role")}
                    </th>
                    <th
                      className="px-4 py-3 cursor-pointer hover:bg-gray-600"
                      onClick={() => requestSort("createdAt")}
                    >
                      Ngày tạo {getSortDirectionIndicator("createdAt")}
                    </th>
                    <th className="px-4 py-3 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-4 py-8 text-center">
                        <div
                          ref={noUsersMessageRef}
                          className="text-3xl font-bold text-orange-500"
                        >
                          Không tìm thấy người dùng nào
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentUsers.map((user, index) => (
                      <tr
                        key={user.id}
                        ref={(el) => (tableRowsRef.current[index] = el)}
                        className={`hover:bg-gray-700 ${
                          index % 2 === 0 ? "bg-gray-750" : ""
                        } transition-colors`}
                        data-aos="fade-up"
                        data-aos-delay={index * 50}
                      >
                        <td className="px-4 py-3">{user.id}</td>
                        <td className="px-4 py-3">{user.username}</td>
                        <td className="px-4 py-3 font-medium">
                          {user.fullName || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-gray-300">
                          {user.email}
                        </td>
                        <td className="px-4 py-3">{user.phone}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getRoleBadgeColor(
                              user.role
                            )}`}
                          >
                            {user.role === "ADMIN"
                              ? "Quản trị viên"
                              : user.role === "STAFF"
                              ? "Nhân viên"
                              : user.role === "OWNER"
                              ? "Chủ salon"
                              : "Người dùng"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => handleUserSelect(user)}
                              className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all cursor-pointer"
                              title="Xem chi tiết"
                              data-aos="fade-left"
                              data-aos-delay="100"
                              onMouseEnter={handleButtonHover}
                              onMouseLeave={handleButtonLeave}
                            >
                              <i className="fas fa-eye w-4 h-4"></i>
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all cursor-pointer"
                              title="Xóa người dùng"
                              data-aos="fade-left"
                              data-aos-delay="200"
                              onMouseEnter={handleButtonHover}
                              onMouseLeave={handleButtonLeave}
                            >
                              <i className="fas fa-trash-alt w-4 h-4"></i>
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

        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-400">
            Hiển thị{" "}
            <span className="font-medium text-white">
              {currentUsers.length}
            </span>{" "}
            trong số{" "}
            <span className="font-medium text-white">
              {filteredUsers.length}
            </span>{" "}
            người dùng
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-700 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              onMouseEnter={handleButtonHover}
              onMouseLeave={handleButtonLeave}
            >
              Trước
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (number) => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`px-3 py-1 rounded-md cursor-pointer ${
                    currentPage === number
                      ? "bg-orange-600"
                      : "bg-gray-700 hover:bg-gray-600"
                  } transition-all`}
                  onMouseEnter={handleButtonHover}
                  onMouseLeave={handleButtonLeave}
                >
                  {number}
                </button>
              )
            )}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-700 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              onMouseEnter={handleButtonHover}
              onMouseLeave={handleButtonLeave}
            >
              Tiếp
            </button>
          </div>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div
            ref={modalRef}
            className="bg-gray-800 w-full max-w-lg rounded-xl overflow-hidden shadow-2xl border border-gray-700"
            data-aos="zoom-in"
          >
            <div className="flex justify-between items-center border-b border-gray-700 p-4">
              <h3 className="text-xl font-bold">Thêm người dùng mới</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 hover:bg-gray-700 rounded-full transition-all cursor-pointer"
                onMouseEnter={handleButtonHover}
                onMouseLeave={handleButtonLeave}
              >
                <i className="fas fa-times w-6 h-6"></i>
              </button>
            </div>
            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div>
                <label className="text-sm text-gray-300">Họ và tên</label>
                <input
                  type="text"
                  value={newUserData.fullName}
                  onChange={(e) =>
                    setNewUserData({ ...newUserData, fullName: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-300">Tên đăng nhập</label>
                <input
                  type="text"
                  value={newUserData.username}
                  onChange={(e) =>
                    setNewUserData({ ...newUserData, username: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-300">Email</label>
                <input
                  type="email"
                  value={newUserData.email}
                  onChange={(e) =>
                    setNewUserData({ ...newUserData, email: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-300">Số điện thoại</label>
                <input
                  type="text"
                  value={newUserData.phone}
                  onChange={(e) =>
                    setNewUserData({ ...newUserData, phone: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-300">Vai trò</label>
                <select
                  value={newUserData.role}
                  onChange={(e) =>
                    setNewUserData({
                      ...newUserData,
                      role: e.target.value,
                      salonId: null,
                    })
                  }
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="USER">Người dùng</option>
                  <option value="STAFF">Nhân viên</option>
                  <option value="ADMIN">Quản trị viên</option>
                  <option value="OWNER">Chủ salon</option>
                </select>
              </div>
              {(newUserData.role === "STAFF" ||
                newUserData.role === "OWNER") && (
                <div>
                  <label className="text-sm text-gray-300">Salon</label>
                  <select
                    value={newUserData.salonId || ""}
                    onChange={(e) =>
                      setNewUserData({
                        ...newUserData,
                        salonId: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  >
                    <option value="">Chọn salon</option>
                    {salons.map((salon) => (
                      <option key={salon.id} value={salon.id}>
                        {salon.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="text-sm text-gray-300">Mật khẩu</label>
                <input
                  type="password"
                  value={newUserData.password}
                  onChange={(e) =>
                    setNewUserData({ ...newUserData, password: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg font-medium transition-all cursor-pointer"
                onMouseEnter={handleButtonHover}
                onMouseLeave={handleButtonLeave}
              >
                Thêm người dùng
              </button>
            </form>
          </div>
        </div>
      )}

      {isViewModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div
            ref={modalRef}
            className="bg-gray-800 w-full max-w-lg rounded-xl overflow-hidden shadow-2xl border border-gray-700"
            data-aos="zoom-in"
          >
            <div className="flex justify-between items-center border-b border-gray-700 p-4">
              <h3 className="text-xl font-bold">Chi tiết người dùng</h3>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="p-1 hover:bg-gray-700 rounded-full transition-all cursor-pointer"
                onMouseEnter={handleButtonHover}
                onMouseLeave={handleButtonLeave}
              >
                <i className="fas fa-times w-6 h-6"></i>
              </button>
            </div>
            <div className="p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-3xl font-bold mb-3">
                  {selectedUser.fullName
                    ? selectedUser.fullName
                        .split(" ")
                        .map((name) => name[0])
                        .join("")
                    : "N/A"}
                </div>
                <p className="text-xl font-bold">
                  {selectedUser.fullName || "N/A"}
                </p>
                <span
                  className={`mt-2 px-3 py-1 rounded-full text-sm font-semibold ${getRoleBadgeColor(
                    selectedUser.role
                  )}`}
                >
                  {selectedUser.role === "ADMIN"
                    ? "Quản trị viên"
                    : selectedUser.role === "STAFF"
                    ? "Nhân viên"
                    : selectedUser.role === "OWNER"
                    ? "Chủ salon"
                    : "Người dùng"}
                </span>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-300">Tên đăng nhập</p>
                    <p className="font-medium">{selectedUser.username}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">ID người dùng</p>
                    <p className="font-medium">{selectedUser.id}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-300">Email</p>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-300">Số điện thoại</p>
                  <p className="font-medium">{selectedUser.phone}</p>
                </div>

                {(selectedUser.role === "STAFF" ||
                  selectedUser.role === "OWNER") && (
                  <div>
                    <p className="text-sm text-gray-300">Salon</p>
                    <p className="font-medium">
                      {salons.find((s) => s.id === selectedUser.salonId)
                        ?.name || "N/A"}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-300">Ngày tạo</p>
                    <p className="font-medium">
                      {formatDate(selectedUser.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">Cập nhật lần cuối</p>
                    <p className="font-medium">
                      {formatDate(selectedUser.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex space-x-3">
                {canEditUser() && (
                  <button
                    onClick={() => {
                      setIsViewModalOpen(false);
                      setIsEditModalOpen(true);
                    }}
                    className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg font-medium transition-all cursor-pointer"
                    onMouseEnter={handleButtonHover}
                    onMouseLeave={handleButtonLeave}
                  >
                    <i className="fas fa-edit mr-2"></i>Chỉnh sửa
                  </button>
                )}
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-all cursor-pointer"
                  onMouseEnter={handleButtonHover}
                  onMouseLeave={handleButtonLeave}
                >
                  <i className="fas fa-times mr-2"></i>Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div
            ref={modalRef}
            className="bg-gray-800 w-full max-w-lg rounded-xl overflow-hidden shadow-2xl border border-gray-700"
            data-aos="zoom-in"
          >
            <div className="flex justify-between items-center border-b border-gray-700 p-4">
              <h3 className="text-xl font-bold">Chỉnh sửa người dùng</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 hover:bg-gray-700 rounded-full transition-all cursor-pointer"
                onMouseEnter={handleButtonHover}
                onMouseLeave={handleButtonLeave}
              >
                <i className="fas fa-times w-6 h-6"></i>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm text-gray-300">Họ và tên</label>
                <input
                  type="text"
                  value={selectedUser.fullName || ""}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      fullName: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-300">Tên đăng nhập</label>
                <input
                  type="text"
                  value={selectedUser.username}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      username: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-300">Email</label>
                <input
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      email: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-300">Số điện thoại</label>
                <input
                  type="text"
                  value={selectedUser.phone}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      phone: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-300">Vai trò</label>
                <select
                  value={selectedUser.role}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      role: e.target.value,
                      salonId:
                        e.target.value === "STAFF" || e.target.value === "OWNER"
                          ? selectedUser.salonId
                          : null,
                    })
                  }
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="USER">Người dùng</option>
                  <option value="STAFF">Nhân viên</option>
                  <option value="ADMIN">Quản trị viên</option>
                  <option value="OWNER">Chủ salon</option>
                </select>
              </div>
              {(selectedUser.role === "STAFF" ||
                selectedUser.role === "OWNER") && (
                <div>
                  <label className="text-sm text-gray-300">Salon</label>
                  <select
                    value={selectedUser.salonId || ""}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        salonId: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  >
                    <option value="">Chọn salon</option>
                    {salons.map((salon) => (
                      <option key={salon.id} value={salon.id}>
                        {salon.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="mt-8 flex space-x-3">
                <button
                  onClick={handleUpdateUser}
                  className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg font-medium transition-all cursor-pointer"
                  onMouseEnter={handleButtonHover}
                  onMouseLeave={handleButtonLeave}
                >
                  <i className="fas fa-save mr-2"></i>Lưu thay đổi
                </button>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-all cursor-pointer"
                  onMouseEnter={handleButtonHover}
                  onMouseLeave={handleButtonLeave}
                >
                  <i className="fas fa-times mr-2"></i>Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isRoleModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div
            ref={modalRef}
            className="bg-gray-800 w-full max-w-4xl rounded-xl overflow-hidden shadow-2xl border border-gray-700"
            data-aos="zoom-in"
          >
            <div className="flex justify-between items-center border-b border-gray-700 p-4">
              <h3 className="text-xl font-bold">{roleModalTitle}</h3>
              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="p-1 hover:bg-gray-700 rounded-full transition-all cursor-pointer"
                onMouseEnter={handleButtonHover}
                onMouseLeave={handleButtonLeave}
              >
                <i className="fas fa-times w-6 h-6"></i>
              </button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-700 text-left">
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Tên đăng nhập</th>
                    <th className="px-4 py-3">Họ và tên</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Số điện thoại</th>
                    <th className="px-4 py-3">Vai trò</th>
                    <th className="px-4 py-3">Ngày tạo</th>
                    <th className="px-4 py-3 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {roleModalUsers.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-4 py-8 text-center">
                        <div
                          ref={noUsersMessageRef}
                          className="text-3xl font-bold text-orange-500"
                        >
                          Không tìm thấy người dùng bạn nhập
                        </div>
                      </td>
                    </tr>
                  ) : (
                    roleModalUsers.map((user, index) => (
                      <tr
                        key={user.id}
                        className={`hover:bg-gray-700 ${
                          index % 2 === 0 ? "bg-gray-750" : ""
                        } transition-colors`}
                        data-aos="fade-up"
                        data-aos-delay={index * 50}
                      >
                        <td className="px-4 py-3">{user.id}</td>
                        <td className="px-4 py-3">{user.username}</td>
                        <td className="px-4 py-3 font-medium">
                          {user.fullName || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-gray-300">
                          {user.email}
                        </td>
                        <td className="px-4 py-3">{user.phone}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getRoleBadgeColor(
                              user.role
                            )}`}
                          >
                            {user.role === "ADMIN"
                              ? "Quản trị viên"
                              : user.role === "STAFF"
                              ? "Nhân viên"
                              : user.role === "OWNER"
                              ? "Chủ salon"
                              : "Người dùng"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => {
                                setIsRoleModalOpen(false);
                                handleUserSelect(user);
                              }}
                              className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all cursor-pointer"
                              title="Xem chi tiết"
                              onMouseEnter={handleButtonHover}
                              onMouseLeave={handleButtonLeave}
                            >
                              <i className="fas fa-eye w-4 h-4"></i>
                            </button>
                            <button
                              onClick={() => {
                                setIsRoleModalOpen(false);
                                handleDeleteUser(user.id);
                              }}
                              className="p-2 bg-red-600 text-white rounded-full hover:bg-red-600 transition-all cursor-pointer"
                              title="Xóa người dùng"
                              onMouseEnter={handleButtonHover}
                              onMouseLeave={handleButtonLeave}
                            >
                              <i className="fas fa-trash-alt w-4 h-4"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {isSuccessModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div
            ref={modalRef}
            className="bg-gray-800 w-full max-w-md rounded-xl shadow-2xl border border-gray-700 p-6"
            data-aos="zoom-in"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="bg-green-600 p-3 rounded-full">
                <i className="fas fa-check w-4 h-4 text-white"></i>
              </div>
            </div>
            <h3 className="text-xl font-bold text-center text-green-400">
              Thành công!
            </h3>
            <p className="text-gray-300 text-center mt-2">{modalMessage}</p>
            <button
              onClick={() => setIsSuccessModalOpen(false)}
              className="w-full mt-6 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-all cursor-pointer"
              onMouseEnter={handleButtonHover}
              onMouseLeave={handleButtonLeave}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {isErrorModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div
            ref={modalRef}
            className="bg-gray-800 w-full max-w-md rounded-xl shadow-2xl border border-gray-700 p-6"
            data-aos="zoom-in"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="bg-red-600 p-3 rounded-full">
                <i className="fas fa-times w-4 h-4 text-white"></i>
              </div>
            </div>
            <h3 className="text-xl font-bold text-center text-red-400">Lỗi!</h3>
            <p className="text-gray-300 text-center mt-2">{modalMessage}</p>
            <button
              onClick={() => setIsErrorModalOpen(false)}
              className="w-full mt-6 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-all cursor-pointer"
              onMouseEnter={handleButtonHover}
              onMouseLeave={handleButtonLeave}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {isConfirmDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div
            ref={modalRef}
            className="bg-gray-800 w-full max-w-md rounded-xl shadow-2xl border border-gray-700 p-6"
            data-aos="zoom-in"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="bg-yellow-600 p-3 rounded-full">
                <i className="fas fa-exclamation-circle p-3 text-2xl text-white"></i>
              </div>
            </div>
            <h3 className="text-xl font-bold text-center text-yellow-400">
              Xác nhận xóa
            </h3>
            <p className="text-gray-300 text-center mt-2">
              Bạn có chắc muốn xóa người dùng này?
            </p>
            <div className="mt-6 flex space-x-4">
              <button
                onClick={confirmDeleteUser}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-all cursor-pointer"
                onMouseEnter={handleButtonHover}
                onMouseLeave={handleButtonLeave}
              >
                Có
              </button>
              <button
                onClick={() => setIsConfirmDeleteModalOpen(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-all cursor-pointer"
                onMouseEnter={handleButtonHover}
                onMouseLeave={handleButtonLeave}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
