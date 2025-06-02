import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Clock,
  Mail,
  Phone,
  MapPin,
  User,
  ChevronDown,
  Grid,
  List,
  Home,
  X,
  Image,
} from "lucide-react";
import TimePicker from "react-time-picker";
import "react-time-picker/dist/TimePicker.css";
import axios from "axios";
import {
  getAllSalons,
  createSalon,
  updateSalon,
  deleteSalon,
  getOwners,
  getOwnerById,
} from "../../api/apiadmin/salonmanager";

const Salons = () => {
  // Modal states
  const [isModalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [salons, setSalons] = useState([]);
  const [filteredSalons, setFilteredSalons] = useState([]);
  const [selectedSalon, setSelectedSalon] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [owners, setOwners] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [editImagePreviews, setEditImagePreviews] = useState([]);
  const [editImages, setEditImages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [districtName, setDistrictName] = useState("");
  const [wardName, setWardName] = useState("");
  const salonsPerPage = 3;

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const navigate = useNavigate();

  const [newSalonData, setNewSalonData] = useState({
    name: "",
    addressDetail: "",
    city: "",
    provinceId: "",
    districtId: "",
    wardId: "",
    openingTime: "08:00",
    closingTime: "20:00",
    contact: "",
    email: "",
    ownerId: "",
    images: [],
  });

  useEffect(() => {
    if (!user.id) {
      setModalMessage("Please log in to manage salons.");
      setIsErrorModalOpen(true);
      setTimeout(() => navigate("/login"), 2000);
    }
  }, [user.id, navigate]);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await axios.get(
          "https://esgoo.net/api-tinhthanh/1/0.htm"
        );
        if (response.data.error === 0) setProvinces(response.data.data);
      } catch (error) {
        setModalMessage("Failed to fetch provinces.");
        setIsErrorModalOpen(true);
      }
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [salonData, ownerData] = await Promise.all([
          getAllSalons(),
          getOwners(),
        ]);
        setSalons(salonData);
        setFilteredSalons(salonData);
        setOwners(ownerData);
      } catch (error) {
        setModalMessage("Failed to fetch data.");
        setIsErrorModalOpen(true);
      } finally {
        setIsLoading(false);
      }
    };
    if (user.id) fetchData();
  }, [user.id]);

  const handleProvinceChange = async (provinceId) => {
    const selectedProvince = provinces.find((p) => p.id === provinceId);
    setNewSalonData({
      ...newSalonData,
      provinceId,
      city: selectedProvince ? selectedProvince.full_name : "",
      districtId: "",
      wardId: "",
      addressDetail: "",
    });
    setDistrictName("");
    setWardName("");
    setDistricts([]);
    setWards([]);
    if (provinceId) {
      try {
        const response = await axios.get(
          `https://esgoo.net/api-tinhthanh/2/${provinceId}.htm`
        );
        if (response.data.error === 0) setDistricts(response.data.data);
      } catch (error) {
        setModalMessage("Failed to fetch districts.");
        setIsErrorModalOpen(true);
      }
    }
  };

  const handleDistrictChange = async (districtId) => {
    const selectedDistrict = districts.find((d) => d.id === districtId);
    setDistrictName(selectedDistrict ? selectedDistrict.full_name : "");
    setNewSalonData({
      ...newSalonData,
      districtId,
      wardId: "",
      addressDetail: "",
    });
    setWardName("");
    setWards([]);
    if (districtId) {
      try {
        const response = await axios.get(
          `https://esgoo.net/api-tinhthanh/3/${districtId}.htm`
        );
        if (response.data.error === 0) setWards(response.data.data);
      } catch (error) {
        setModalMessage("Failed to fetch wards.");
        setIsErrorModalOpen(true);
      }
    }
  };

  const handleWardChange = (wardId) => {
    const selectedWard = wards.find((w) => w.id === wardId);
    setWardName(selectedWard ? selectedWard.full_name : "");
    setNewSalonData({
      ...newSalonData,
      wardId,
      addressDetail: "",
    });
  };

  useEffect(() => {
    let result = [...salons];
    if (searchQuery) {
      result = result.filter(
        (salon) =>
          salon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          salon.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          salon.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    result.sort((a, b) => (sortOrder === "asc" ? a.id - b.id : b.id - a.id));
    setFilteredSalons(result);
    setCurrentPage(1);
  }, [searchQuery, sortOrder, salons]);

  const indexOfLastSalon = currentPage * salonsPerPage;
  const indexOfFirstSalon = indexOfLastSalon - salonsPerPage;
  const currentSalons = filteredSalons.slice(
    indexOfFirstSalon,
    indexOfLastSalon
  );
  const totalPages = Math.ceil(filteredSalons.length / salonsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSort = () => setSortOrder(sortOrder === "asc" ? "desc" : "asc");

  const validateForm = () => {
    const errors = {};
    if (!newSalonData.name.trim()) errors.name = "Tên salon là bắt buộc";
    if (!newSalonData.addressDetail.trim())
      errors.addressDetail = "Địa chỉ chi tiết là bắt buộc";
    if (!newSalonData.city.trim()) errors.city = "Tỉnh/Thành phố là bắt buộc";
    if (!newSalonData.provinceId)
      errors.provinceId = "Tỉnh/Thành phố là bắt buộc";
    if (!newSalonData.districtId) errors.districtId = "Quận/Huyện là bắt buộc";
    if (!newSalonData.wardId) errors.wardId = "Phường/Xã là bắt buộc";
    if (!newSalonData.openingTime)
      errors.openingTime = "Giờ mở cửa là bắt buộc";
    if (!newSalonData.closingTime)
      errors.closingTime = "Giờ đóng cửa là bắt buộc";
    if (!newSalonData.contact.trim())
      errors.contact = "Số điện thoại là bắt buộc";
    if (!newSalonData.email.trim()) errors.email = "Email là bắt buộc";
    else if (!/\S+@\S+\.\S+/.test(newSalonData.email))
      errors.email = "Email không hợp lệ";
    return errors;
  };

  const checkOwnerAssignment = (ownerId, currentSalonId = null) => {
    if (!ownerId) return null;
    const assignedSalon = salons.find(
      (salon) =>
        salon.ownerId === parseInt(ownerId) &&
        (!currentSalonId || salon.id !== currentSalonId)
    );
    return assignedSalon ? assignedSalon.name : null;
  };

  const handleAddSalon = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (newSalonData.ownerId) {
      const assignedSalonName = checkOwnerAssignment(newSalonData.ownerId);
      if (assignedSalonName) {
        errors.ownerId = `Chủ sở hữu này đã được gán cho salon "${assignedSalonName}".`;
      }
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    try {
      const fullAddress = [
        newSalonData.city,
        districtName,
        wardName,
        newSalonData.addressDetail,
      ].join("|");

      const salonData = {
        name: newSalonData.name,
        address: fullAddress,
        city: newSalonData.city,
        provinceId: newSalonData.provinceId,
        districtId: newSalonData.districtId,
        wardId: newSalonData.wardId,
        openingTime: newSalonData.openingTime + ":00",
        closingTime: newSalonData.closingTime + ":00",
        contact: newSalonData.contact,
        email: newSalonData.email,
        ownerId: newSalonData.ownerId ? parseInt(newSalonData.ownerId) : null,
        images: newSalonData.images.length > 0 ? newSalonData.images : [],
      };
      const createdSalon = await createSalon(salonData);
      setSalons((prev) => [...prev, createdSalon]);
      setIsAddModalOpen(false);
      setNewSalonData({
        name: "",
        addressDetail: "",
        city: "",
        provinceId: "",
        districtId: "",
        wardId: "",
        openingTime: "08:00",
        closingTime: "20:00",
        contact: "",
        email: "",
        ownerId: "",
        images: [],
      });
      setDistrictName("");
      setWardName("");
      setImagePreviews([]);
      setFormErrors({});
      setModalMessage("Salon added successfully!");
      setIsSuccessModalOpen(true);
    } catch (error) {
      setModalMessage(error.response?.data?.message || "Failed to add salon.");
      setIsErrorModalOpen(true);
    }
  };

  const handleImageUpload = (e, isEdit = false) => {
    const files = Array.from(e.target.files);
    const imageNames = files.map((file) => file.name);
    const previews = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });
    Promise.all(previews).then((previewUrls) => {
      if (isEdit) {
        setEditImages([...editImages, ...imageNames]);
        setEditImagePreviews([...editImagePreviews, ...previewUrls]);
        setSelectedSalon({
          ...selectedSalon,
          images: [...selectedSalon.images, ...imageNames],
        });
      } else {
        setNewSalonData({
          ...newSalonData,
          images: [...newSalonData.images, ...imageNames],
        });
        setImagePreviews([...imagePreviews, ...previewUrls]);
      }
    });
  };

  const handleRemoveImage = (index, isEdit = false) => {
    if (isEdit) {
      setEditImages(editImages.filter((_, i) => i !== index));
      setEditImagePreviews(editImagePreviews.filter((_, i) => i !== index));
      setSelectedSalon({
        ...selectedSalon,
        images: selectedSalon.images.filter((_, i) => i !== index),
      });
    } else {
      setNewSalonData({
        ...newSalonData,
        images: newSalonData.images.filter((_, i) => i !== index),
      });
      setImagePreviews(imagePreviews.filter((_, i) => i !== index));
    }
  };

  const handleViewDetails = (salon) => {
    setSelectedSalon(salon);
    setIsDetailModalOpen(true);
  };

  const handleEditSalon = async () => {
    try {
      const errors = {};
      if (!selectedSalon.name.trim()) errors.name = "Tên salon là bắt buộc";
      if (!selectedSalon.addressDetail && !selectedSalon.address.split("|")[3])
        errors.addressDetail = "Địa chỉ chi tiết là bắt buộc";
      if (!selectedSalon.city) errors.city = "Tỉnh/Thành phố là bắt buộc";
      if (!selectedSalon.provinceId)
        errors.provinceId = "Tỉnh/Thành phố là bắt buộc";
      if (!selectedSalon.districtId)
        errors.districtId = "Quận/Huyện là bắt buộc";
      if (!selectedSalon.wardId) errors.wardId = "Phường/Xã là bắt buộc";
      if (!selectedSalon.openingTime)
        errors.openingTime = "Giờ mở cửa là bắt buộc";
      if (!selectedSalon.closingTime)
        errors.closingTime = "Giờ đóng cửa là bắt buộc";
      if (!selectedSalon.contact.trim())
        errors.contact = "Số điện thoại là bắt buộc";
      if (!selectedSalon.email.trim()) errors.email = "Email là bắt buộc";
      else if (!/\S+@\S+\.\S+/.test(selectedSalon.email))
        errors.email = "Email không hợp lệ";
      if (selectedSalon.ownerId) {
        const assignedSalonName = checkOwnerAssignment(
          selectedSalon.ownerId,
          selectedSalon.id
        );
        if (assignedSalonName) {
          errors.ownerId = `Chủ sở hữu này đã được gán cho salon "${assignedSalonName}".`;
        }
      }
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      const selectedProvince = provinces.find(
        (p) => p.id === selectedSalon.provinceId
      );
      const openingTime = selectedSalon.openingTime.includes(":")
        ? selectedSalon.openingTime
        : selectedSalon.openingTime + ":00";
      const closingTime = selectedSalon.closingTime.includes(":")
        ? selectedSalon.closingTime
        : selectedSalon.closingTime + ":00";

      const fullAddress = [
        selectedProvince ? selectedProvince.full_name : selectedSalon.city,
        districtName || selectedSalon.districtName || "",
        wardName || selectedSalon.wardName || "",
        selectedSalon.addressDetail ||
          selectedSalon.address.split("|")[3] ||
          "",
      ].join("|");

      const salonData = {
        name: selectedSalon.name,
        address: fullAddress,
        city: selectedProvince
          ? selectedProvince.full_name
          : selectedSalon.city,
        provinceId: selectedSalon.provinceId,
        districtId: selectedSalon.districtId,
        wardId: selectedSalon.wardId,
        openingTime,
        closingTime,
        contact: selectedSalon.contact,
        email: selectedSalon.email,
        ownerId: selectedSalon.ownerId ? parseInt(selectedSalon.ownerId) : null,
        images: selectedSalon.images || [],
      };
      const updatedSalon = await updateSalon(selectedSalon.id, salonData);
      setSalons((prev) =>
        prev.map((salon) =>
          salon.id === updatedSalon.id ? updatedSalon : salon
        )
      );
      setIsEditModalOpen(false);
      setEditImagePreviews([]);
      setEditImages([]);
      setFormErrors({});
      setModalMessage("Salon updated successfully!");
      setIsSuccessModalOpen(true);
    } catch (error) {
      setModalMessage("Failed to update salon.");
      setIsErrorModalOpen(true);
    }
  };

  const handleDeleteSalon = async () => {
    try {
      await deleteSalon(selectedSalon.id);
      setSalons((prev) =>
        prev.filter((salon) => salon.id !== selectedSalon.id)
      );
      setIsDeleteModalOpen(false);
      setIsDetailModalOpen(false);
      setModalMessage("Salon deleted successfully!");
      setIsSuccessModalOpen(true);
    } catch (error) {
      setModalMessage("Failed to delete salon.");
      setIsErrorModalOpen(true);
    }
  };

  const handleViewOwnerInfo = async () => {
    try {
      const ownerData = await getOwnerById(selectedSalon.ownerId);
      setSelectedOwner(ownerData);
      setIsOwnerModalOpen(true);
    } catch (error) {
      setModalMessage("Failed to fetch owner information.");
      setIsErrorModalOpen(true);
    }
  };

  const handleViewImage = (index) => {
    setSelectedImageIndex(index);
    setIsImageModalOpen(true);
  };

  const displayFullAddress = (address) => {
    return (address ?? "").split("|").filter(Boolean).join(", ");
  };

  const fullAddress = displayFullAddress(selectedSalon?.address);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 text-white">
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900">
          <div className="space-y-6 text-center">
            <div className="inline-block relative">
              <div className="w-24 h-24 rounded-full border-t-4 border-b-4 border-purple-500 animate-spin"></div>
              <div className="w-20 h-20 absolute top-2 left-2 rounded-full border-t-4 border-b-4 border-pink-500 animate-spin animate-pulse"></div>
              <div className="w-16 h-16 absolute top-4 left-4 rounded-full border-t-4 border-b-4 border-indigo-500 animate-spin animate-ping"></div>
            </div>
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
              Đang tải dữ liệu salon...
            </h2>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-10">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-400 mb-4">
            Quản lý danh sách Salon
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Hệ thống quản trị salon chuyên nghiệp, theo dõi và quản lý tất cả
            các salon của bạn một cách hiệu quả.
          </p>
        </header>

        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="w-full md:w-96 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm salon theo tên, địa chỉ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-lg"
            />
            {searchQuery && filteredSalons.length > 0 && (
              <div className="absolute top-full left-0 w-full bg-gray-800/90 rounded-lg mt-1 max-h-60 overflow-y-auto z-10">
                {filteredSalons.map((salon) => (
                  <div
                    key={salon.id}
                    className="flex items-center p-2 border-b border-gray-700/50 hover:bg-gray-700/50 cursor-pointer"
                    onClick={() => handleViewDetails(salon)}
                  >
                    <img
                      src={
                        salon.images && salon.images.length > 0
                          ? `http://localhost:8084/salon-images/${salon.images[0]}`
                          : "/api/placeholder/50/50"
                      }
                      alt={salon.name}
                      className="w-12 h-12 object-cover rounded-lg mr-2"
                    />
                    <div>
                      <p className="text-sm font-medium text-white">
                        {salon.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {displayFullAddress(salon.address)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex rounded-lg overflow-hidden backdrop-blur-lg">
              <button
                className={`p-2 ${
                  viewMode === "grid"
                    ? "bg-purple-600/70 text-white"
                    : "bg-gray-800/50 text-gray-300"
                }`}
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                className={`p-2 ${
                  viewMode === "list"
                    ? "bg-purple-600/70 text-white"
                    : "bg-gray-800/50 text-gray-300"
                }`}
                onClick={() => setViewMode("list")}
              >
                <List className="h-5 w-5" />
              </button>
            </div>

            <button
              onClick={handleSort}
              className="flex items-center px-4 py-2 bg-gray-800/50 text-white rounded-lg hover:bg-gray-700/50 transition-colors backdrop-blur-lg border border-gray-700/30"
            >
              <Filter className="h-5 w-5 mr-2" />
              Sắp xếp theo ID ({sortOrder === "asc" ? "Tăng" : "Giảm"})
              <ChevronDown className="h-4 w-4 ml-2" />
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors shadow-lg"
              disabled={!user.id}
            >
              <Plus className="h-5 w-5 mr-2" />
              Thêm salon mới
            </button>
          </div>
        </div>

        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentSalons.map((salon) => (
              <div
                key={salon.id}
                className="group bg-gray-800/30 backdrop-blur-md rounded-xl overflow-hidden border border-gray-700/30 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={
                      salon.images && salon.images.length > 0
                        ? `http://localhost:8084/salon-images/${salon.images[0]}`
                        : "/api/placeholder/600/400"
                    }
                    alt={salon.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 cursor-pointer"
                    onClick={() => {
                      setSelectedSalon(salon);
                      handleViewImage(0);
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-80"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h2 className="text-xl font-bold text-white">
                      {salon.name}
                    </h2>
                    <div className="flex items-center mt-1 text-gray-300">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="ml-1 text-sm truncate">
                        {displayFullAddress(salon.address)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-center text-gray-300">
                    <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="ml-2 text-sm">
                      {salon.openingTime} - {salon.closingTime}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="ml-2 text-sm">{salon.contact}</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="ml-2 text-sm truncate">{salon.email}</span>
                  </div>
                  <div className="pt-2 flex justify-end space-x-2">
                    <button
                      onClick={() => handleViewDetails(salon)}
                      className="px-3 py-1 text-sm bg-indigo-600/70 text-white rounded-md hover:bg-indigo-500/70 transition-colors"
                    >
                      Chi tiết
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSalon(salon);
                        setIsEditModalOpen(true);
                      }}
                      className="p-1 text-indigo-400 hover:text-indigo-300"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSalon(salon);
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-1 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden shadow-lg rounded-xl backdrop-blur-lg border border-gray-800/50">
                <table className="min-w-full divide-y divide-gray-800/50">
                  <thead className="bg-gray-900/50">
                    <tr>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Tên salon
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Địa chỉ
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Tỉnh/Thành phố
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Giờ mở cửa
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Liên hệ
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800/30 divide-y divide-gray-800/50">
                    {currentSalons.map((salon) => (
                      <tr
                        key={salon.id}
                        className="hover:bg-gray-700/30 transition-colors"
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">
                          {salon.id}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                          {salon.name}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                            <span>{displayFullAddress(salon.address)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                          {salon.city}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1 text-gray-400" />
                            <span>
                              {salon.openingTime} - {salon.closingTime}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-1 text-gray-400" />
                            <span>{salon.contact}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-1 text-gray-400" />
                            <span>{salon.email}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewDetails(salon)}
                              className="text-indigo-400 hover:text-indigo-300"
                            >
                              Chi tiết
                            </button>
                            <button
                              onClick={() => {
                                setSelectedSalon(salon);
                                setIsEditModalOpen(true);
                              }}
                              className="text-indigo-400 hover:text-indigo-300"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedSalon(salon);
                                setIsDeleteModalOpen(true);
                              }}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-400">
            Hiển thị{" "}
            <span className="font-medium text-white">
              {filteredSalons.length}
            </span>{" "}
            salon
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-800/50 text-white rounded-lg border border-gray-700/50 hover:bg-gray-700/50 transition-colors backdrop-blur-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => paginate(page)}
                className={`px-4 py-2 ${
                  currentPage === page
                    ? "bg-purple-600/70 text-white"
                    : "bg-gray-800/50 text-white"
                } rounded-lg border border-gray-700/50 hover:bg-gray-700/50 transition-colors backdrop-blur-lg`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-800/50 text-white rounded-lg border border-gray-700/50 hover:bg-gray-700/50 transition-colors backdrop-blur-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center overflow-x-auto">
          <div className="bg-gradient-to-br from-gray-900 to-indigo-900 w-full max-w-5xl min-w-[90%] rounded-2xl shadow-2xl border border-gray-800 p-8 m-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
                Thêm Salon Mới
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setFormErrors({});
                  setImagePreviews([]);
                }}
                className="text-gray-400 hover:text-white transition"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleAddSalon} className="space-y-6">
              <div className="flex flex-wrap gap-6">
                <div className="flex-1 min-w-[280px]">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tên salon
                  </label>
                  <input
                    type="text"
                    value={newSalonData.name}
                    onChange={(e) =>
                      setNewSalonData({ ...newSalonData, name: e.target.value })
                    }
                    className={`w-full px-4 py-2 bg-gray-800/50 border ${
                      formErrors.name ? "border-red-500" : "border-gray-700"
                    } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition shadow-sm`}
                    placeholder="Nhập tên salon"
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.name}
                    </p>
                  )}
                </div>
                <div className="flex-1 min-w-[280px]">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tỉnh/Thành phố
                  </label>
                  <select
                    value={newSalonData.provinceId}
                    onChange={(e) => handleProvinceChange(e.target.value)}
                    className={`w-full px-4 py-2 bg-gray-800/50 border ${
                      formErrors.city ? "border-red-500" : "border-gray-700"
                    } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition shadow-sm`}
                  >
                    <option value="">Chọn Tỉnh/Thành phố</option>
                    {provinces.map((province) => (
                      <option key={province.id} value={province.id}>
                        {province.full_name}
                      </option>
                    ))}
                  </select>
                  {formErrors.city && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.city}
                    </p>
                  )}
                </div>
                <div className="flex-1 min-w-[280px]">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Quận/Huyện
                  </label>
                  <select
                    value={newSalonData.districtId}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className={`w-full px-4 py-2 bg-gray-800/50 border ${
                      formErrors.districtId
                        ? "border-red-500"
                        : "border-gray-700"
                    } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition shadow-sm`}
                    disabled={!newSalonData.provinceId}
                  >
                    <option value="">Chọn Quận/Huyện</option>
                    {districts.map((district) => (
                      <option key={district.id} value={district.id}>
                        {district.full_name}
                      </option>
                    ))}
                  </select>
                  {formErrors.districtId && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.districtId}
                    </p>
                  )}
                </div>
                <div className="flex-1 min-w-[280px]">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phường/Xã
                  </label>
                  <select
                    value={newSalonData.wardId}
                    onChange={(e) => handleWardChange(e.target.value)}
                    className={`w-full px-4 py-2 bg-gray-800/50 border ${
                      formErrors.wardId ? "border-red-500" : "border-gray-700"
                    } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition shadow-sm`}
                    disabled={!newSalonData.districtId}
                  >
                    <option value="">Chọn Phường/Xã</option>
                    {wards.map((ward) => (
                      <option key={ward.id} value={ward.id}>
                        {ward.full_name}
                      </option>
                    ))}
                  </select>
                  {formErrors.wardId && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.wardId}
                    </p>
                  )}
                </div>
                <div className="flex-1 min-w-[280px]">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Địa chỉ chi tiết
                  </label>
                  <input
                    type="text"
                    value={newSalonData.addressDetail}
                    onChange={(e) =>
                      setNewSalonData({
                        ...newSalonData,
                        addressDetail: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-2 bg-gray-800/50 border ${
                      formErrors.addressDetail
                        ? "border-red-500"
                        : "border-gray-700"
                    } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition shadow-sm`}
                    placeholder="Nhập số nhà, đường"
                  />
                  {formErrors.addressDetail && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.addressDetail}
                    </p>
                  )}
                </div>
                <div className="flex-1 min-w-[280px]">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Giờ mở cửa
                  </label>
                  <TimePicker
                    onChange={(value) =>
                      setNewSalonData({
                        ...newSalonData,
                        openingTime: value || "08:00",
                      })
                    }
                    value={newSalonData.openingTime}
                    format="HH:mm"
                    disableClock
                    clearIcon={null}
                    className={`w-full px-4 py-2 bg-gray-800/50 border ${
                      formErrors.openingTime
                        ? "border-red-500"
                        : "border-gray-700"
                    } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition shadow-sm`}
                  />
                  {formErrors.openingTime && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.openingTime}
                    </p>
                  )}
                </div>
                <div className="flex-1 min-w-[280px]">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Giờ đóng cửa
                  </label>
                  <TimePicker
                    onChange={(value) =>
                      setNewSalonData({
                        ...newSalonData,
                        closingTime: value || "20:00",
                      })
                    }
                    value={newSalonData.closingTime}
                    format="HH:mm"
                    disableClock
                    clearIcon={null}
                    className={`w-full px-4 py-2 bg-gray-800/50 border ${
                      formErrors.closingTime
                        ? "border-red-500"
                        : "border-gray-700"
                    } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition shadow-sm`}
                  />
                  {formErrors.closingTime && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.closingTime}
                    </p>
                  )}
                </div>
                <div className="flex-1 min-w-[280px]">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    value={newSalonData.contact}
                    onChange={(e) =>
                      setNewSalonData({
                        ...newSalonData,
                        contact: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-2 bg-gray-800/50 border ${
                      formErrors.contact ? "border-red-500" : "border-gray-700"
                    } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition shadow-sm`}
                    placeholder="Nhập số điện thoại"
                  />
                  {formErrors.contact && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.contact}
                    </p>
                  )}
                </div>
                <div className="flex-1 min-w-[280px]">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newSalonData.email}
                    onChange={(e) =>
                      setNewSalonData({
                        ...newSalonData,
                        email: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-2 bg-gray-800/50 border ${
                      formErrors.email ? "border-red-500" : "border-gray-700"
                    } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition shadow-sm`}
                    placeholder="Nhập email"
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.email}
                    </p>
                  )}
                </div>
                <div className="flex-1 min-w-[280px]">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Chủ salon (không bắt buộc)
                  </label>
                  <select
                    value={newSalonData.ownerId}
                    onChange={(e) =>
                      setNewSalonData({
                        ...newSalonData,
                        ownerId: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-2 bg-gray-800/50 border ${
                      formErrors.ownerId ? "border-red-500" : "border-gray-700"
                    } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition shadow-sm`}
                  >
                    <option value="">Không chọn chủ salon</option>
                    {owners.map((owner) => (
                      <option key={owner.id} value={owner.id}>
                        {owner.fullName} ({owner.email})
                      </option>
                    ))}
                  </select>
                  {formErrors.ownerId && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.ownerId}
                    </p>
                  )}
                </div>
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Hình ảnh
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition shadow-sm"
                  />
                  {imagePreviews.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-3">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-24 h-24 object-cover rounded-lg shadow-md border border-gray-700"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {newSalonData.images.length > 0 && (
                    <p className="text-gray-400 text-xs mt-2">
                      Đã chọn: {newSalonData.images.join(", ")}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setFormErrors({});
                    setImagePreviews([]);
                  }}
                  className="px-5 py-2 bg-gray-800/70 text-gray-300 rounded-lg hover:bg-gray-700/70 transition shadow-sm"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition shadow-sm"
                >
                  Thêm Salon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && selectedSalon && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center overflow-x-auto">
          <div className="bg-gradient-to-br from-gray-900 to-indigo-900 w-full max-w-5xl min-w-[90%] rounded-2xl shadow-2xl border border-gray-800 p-8 m-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
                Chỉnh sửa Salon
              </h3>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditImagePreviews([]);
                  setEditImages([]);
                  setFormErrors({});
                }}
                className="text-gray-400 hover:text-white transition"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-6">
              <div className="flex flex-wrap gap-6">
                <div className="flex-1 min-w-[280px]">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tên salon
                  </label>
                  <input
                    type="text"
                    value={selectedSalon.name}
                    onChange={(e) =>
                      setSelectedSalon({
                        ...selectedSalon,
                        name: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-2 bg-gray-800/50 border ${
                      formErrors.name ? "border-red-500" : "border-gray-700"
                    } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition shadow-sm`}
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.name}
                    </p>
                  )}
                </div>
                <div className="flex-1 min-w-[280px]">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tỉnh/Thành phố
                  </label>
                  <select
                    value={selectedSalon.provinceId}
                    onChange={(e) => {
                      const selectedProvince = provinces.find(
                        (p) => p.id === e.target.value
                      );
                      setSelectedSalon({
                        ...selectedSalon,
                        provinceId: e.target.value,
                        city: selectedProvince
                          ? selectedProvince.full_name
                          : "",
                        districtId: "",
                        wardId: "",
                        addressDetail: "",
                      });
                      setDistrictName("");
                      setWardName("");
                      handleProvinceChange(e.target.value);
                    }}
                    className={`w-full px-4 py-2 bg-gray-800/50 border ${
                      formErrors.city ? "border-red-500" : "border-gray-700"
                    } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition shadow-sm`}
                  >
                    <option value="">Chọn Tỉnh/Thành phố</option>
                    {provinces.map((province) => (
                      <option key={province.id} value={province.id}>
                        {province.full_name}
                      </option>
                    ))}
                  </select>
                  {formErrors.city && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.city}
                    </p>
                  )}
                </div>
                <div className="flex-1 min-w-[280px]">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Quận/Huyện
                  </label>
                  <select
                    value={selectedSalon.districtId}
                    onChange={(e) => {
                      const selectedDistrict = districts.find(
                        (d) => d.id === e.target.value
                      );
                      setDistrictName(
                        selectedDistrict ? selectedDistrict.full_name : ""
                      );
                      setSelectedSalon({
                        ...selectedSalon,
                        districtId: e.target.value,
                        wardId: "",
                        addressDetail: "",
                      });
                      setWardName("");
                      handleDistrictChange(e.target.value);
                    }}
                    className={`w-full px-4 py-2 bg-gray-800/50 border ${
                      formErrors.districtId
                        ? "border-red-500"
                        : "border-gray-700"
                    } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition shadow-sm`}
                    disabled={!selectedSalon.provinceId}
                  >
                    <option value="">Chọn Quận/Huyện</option>
                    {districts.map((district) => (
                      <option key={district.id} value={district.id}>
                        {district.full_name}
                      </option>
                    ))}
                  </select>
                  {formErrors.districtId && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.districtId}
                    </p>
                  )}
                </div>
                <div className="flex-1 min-w-[280px]">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phường/Xã
                  </label>
                  <select
                    value={selectedSalon.wardId}
                    onChange={(e) => {
                      const selectedWard = wards.find(
                        (w) => w.id === e.target.value
                      );
                      setWardName(selectedWard ? selectedWard.full_name : "");
                      setSelectedSalon({
                        ...selectedSalon,
                        wardId: e.target.value,
                        addressDetail: "",
                      });
                    }}
                    className={`w-full px-4 py-2 bg-gray-800/50 border ${
                      formErrors.wardId ? "border-red-500" : "border-gray-700"
                    } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition shadow-sm`}
                    disabled={!selectedSalon.districtId}
                  >
                    <option value="">Chọn Phường/Xã</option>
                    {wards.map((ward) => (
                      <option key={ward.id} value={ward.id}>
                        {ward.full_name}
                      </option>
                    ))}
                  </select>
                  {formErrors.wardId && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.wardId}
                    </p>
                  )}
                </div>
                <div className="flex-1 min-w-[280px]">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Địa chỉ chi tiết
                  </label>
                  <input
                    type="text"
                    value={
                      selectedSalon.addressDetail ||
                      selectedSalon.address.split("|")[3] ||
                      ""
                    }
                    onChange={(e) =>
                      setSelectedSalon({
                        ...selectedSalon,
                        addressDetail: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-2 bg-gray-800/50 border ${
                      formErrors.addressDetail
                        ? "border-red-500"
                        : "border-gray-700"
                    } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition shadow-sm`}
                    placeholder="Nhập số nhà, đường"
                  />
                  {formErrors.addressDetail && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.addressDetail}
                    </p>
                  )}
                </div>
                <div className="flex-1 min-w-[280px]">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Giờ mở cửa
                  </label>
                  <TimePicker
                    onChange={(value) =>
                      setSelectedSalon({
                        ...selectedSalon,
                        openingTime: value || "08:00",
                      })
                    }
                    value={selectedSalon.openingTime
                      .split(":")
                      .slice(0, 2)
                      .join(":")}
                    format="HH:mm"
                    disableClock
                    clearIcon={null}
                    className={`w-full px-4 py-2 bg-gray-800/50 border ${
                      formErrors.openingTime
                        ? "border-red-500"
                        : "border-gray-700"
                    } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition shadow-sm`}
                  />
                  {formErrors.openingTime && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.openingTime}
                    </p>
                  )}
                </div>
                <div className="flex-1 min-w-[280px]">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Giờ đóng cửa
                  </label>
                  <TimePicker
                    onChange={(value) =>
                      setSelectedSalon({
                        ...selectedSalon,
                        closingTime: value || "20:00",
                      })
                    }
                    value={selectedSalon.closingTime
                      .split(":")
                      .slice(0, 2)
                      .join(":")}
                    format="HH:mm"
                    disableClock
                    clearIcon={null}
                    className={`w-full px-4 py-2 bg-gray-800/50 border ${
                      formErrors.closingTime
                        ? "border-red-500"
                        : "border-gray-700"
                    } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition shadow-sm`}
                  />
                  {formErrors.closingTime && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.closingTime}
                    </p>
                  )}
                </div>
                <div className="flex-1 min-w-[280px]">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    value={selectedSalon.contact}
                    onChange={(e) =>
                      setSelectedSalon({
                        ...selectedSalon,
                        contact: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-2 bg-gray-800/50 border ${
                      formErrors.contact ? "border-red-500" : "border-gray-700"
                    } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition shadow-sm`}
                  />
                  {formErrors.contact && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.contact}
                    </p>
                  )}
                </div>
                <div className="flex-1 min-w-[280px]">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={selectedSalon.email}
                    onChange={(e) =>
                      setSelectedSalon({
                        ...selectedSalon,
                        email: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-2 bg-gray-800/50 border ${
                      formErrors.email ? "border-red-500" : "border-gray-700"
                    } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition shadow-sm`}
                    placeholder="Nhập email"
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.email}
                    </p>
                  )}
                </div>
                <div className="flex-1 min-w-[280px]">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Chủ salon (không bắt buộc)
                  </label>
                  <select
                    value={selectedSalon.ownerId || ""}
                    onChange={(e) =>
                      setSelectedSalon({
                        ...selectedSalon,
                        ownerId: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-2 bg-gray-800/50 border ${
                      formErrors.ownerId ? "border-red-500" : "border-gray-700"
                    } rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition shadow-sm`}
                  >
                    <option value="">Không chọn chủ salon</option>
                    {owners.map((owner) => (
                      <option key={owner.id} value={owner.id}>
                        {owner.fullName} ({owner.email})
                      </option>
                    ))}
                  </select>
                  {formErrors.ownerId && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.ownerId}
                    </p>
                  )}
                </div>
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Hình ảnh
                  </label>
                  {selectedSalon.images && selectedSalon.images.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-3">
                      {selectedSalon.images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={`http://localhost:8084/salon-images/${image}`}
                            alt={`Current image ${index + 1}`}
                            className="w-24 h-24 object-cover rounded-lg shadow-md border border-gray-700"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index, true)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, true)}
                    className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition shadow-sm mt-3"
                  />
                  {editImagePreviews.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-3">
                      {editImagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-24 h-24 object-cover rounded-lg shadow-md border border-gray-700"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index, true)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {editImages.length > 0 && (
                    <p className="text-gray-400 text-xs mt-2">
                      Hình ảnh mới: {editImages.join(", ")}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditImagePreviews([]);
                    setEditImages([]);
                    setFormErrors({});
                  }}
                  className="px-5 py-2 bg-gray-800/70 text-gray-300 rounded-lg hover:bg-gray-700/70 transition shadow-sm"
                >
                  Hủy
                </button>
                <button
                  onClick={handleEditSalon}
                  className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition shadow-sm"
                >
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isDetailModalOpen && selectedSalon && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black/60 backdrop-blur-sm"
          onClick={() => setIsDetailModalOpen(false)}
        >
          <div
            className="bg-gradient-to-br from-gray-900 to-indigo-900 p-6 rounded-2xl max-w-2xl w-full mx-4 shadow-2xl border border-gray-700/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                {selectedSalon.name}
              </h2>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="mb-6 rounded-lg overflow-hidden relative">
              <img
                src={
                  selectedSalon.images && selectedSalon.images.length > 0
                    ? `http://localhost:8084/salon-images/${selectedSalon.images[0]}`
                    : "/api/placeholder/600/400"
                }
                alt={selectedSalon.name}
                className="w-full h-56 object-cover cursor-pointer"
                onClick={() => handleViewImage(0)}
              />
              {selectedSalon.images && selectedSalon.images.length > 1 && (
                <div className="absolute bottom-2 right-2 bg-gray-800/70 rounded-full px-2 py-1 text-xs text-white">
                  {selectedSalon.images.length} ảnh
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 flex items-center justify-center bg-indigo-900/50 rounded-lg mr-3">
                    <MapPin className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Địa chỉ</p>
                    <p
                      className="text-white cursor-pointer hover:text-indigo-300"
                      onClick={() => setModalOpen(true)}
                    >
                      {fullAddress}
                    </p>
                    {isModalOpen && (
                      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-[rgb(30,30,60)] text-[rgb(220,220,220)] p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
                          <h2 className="text-lg font-semibold mb-4">
                            Địa chỉ chi tiết
                          </h2>
                          <p className="min-h-[60px]">{fullAddress}</p>
                          <button
                            onClick={() => setModalOpen(false)}
                            className="mt-6 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded"
                          >
                            Đóng
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 flex items-center justify-center bg-indigo-900/50 rounded-lg mr-3">
                    <Clock className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Giờ mở cửa</p>
                    <p className="text-white">
                      {selectedSalon.openingTime} - {selectedSalon.closingTime}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 flex items-center justify-center bg-indigo-900/50 rounded-lg mr-3">
                    <Phone className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Số điện thoại</p>
                    <p className="text-white">{selectedSalon.contact}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 flex items-center justify-center bg-indigo-900/50 rounded-lg mr-3">
                    <Mail className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="text-white">{selectedSalon.email}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 flex items-center justify-center bg-indigo-900/50 rounded-lg mr-3">
                    <User className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">ID Chủ sở hữu</p>
                    <p className="text-white">
                      {selectedSalon.ownerId || "Không có"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 flex items-center justify-center bg-indigo-900/50 rounded-lg mr-3">
                    <Home className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">ID Salon</p>
                    <p className="text-white">{selectedSalon.id}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-3 border-t border-gray-700/50">
              {selectedSalon.ownerId && (
                <button
                  onClick={handleViewOwnerInfo}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Thông tin chủ salon
                </button>
              )}
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 bg-gray-800/70 text-gray-300 rounded-lg hover:bg-gray-700/70 transition-colors"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setIsEditModalOpen(true);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Chỉnh sửa
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && selectedSalon && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-gray-900 w-full max-w-md rounded-xl shadow-2xl border border-gray-800 p-6">
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
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-bold text-center text-yellow-400">
              Xác nhận xóa
            </h3>
            <p className="text-gray-300 text-center mt-2">
              Bạn có chắc muốn xóa salon "{selectedSalon.name}"?
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-800/70 text-gray-300 rounded-lg hover:bg-gray-700/70 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteSalon}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {isOwnerModalOpen && selectedOwner && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
          onClick={() => setIsOwnerModalOpen(false)}
        >
          <div
            className="bg-gradient-to-br from-gray-900 to-indigo-900 p-6 rounded-2xl max-w-md w-full mx-4 shadow-2xl border border-gray-700/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                Thông tin chủ salon
              </h2>
              <button
                onClick={() => setIsOwnerModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-8 h-8 flex items-center justify-center bg-indigo-900/50 rounded-lg mr-3">
                  <User className="h-4 w-4 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Họ tên</p>
                  <p className="text-white">{selectedOwner.fullName}</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 flex items-center justify-center bg-indigo-900/50 rounded-lg mr-3">
                  <Mail className="h-4 w-4 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="text-white">{selectedOwner.email}</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 flex items-center justify-center bg-indigo-900/50 rounded-lg mr-3">
                  <Phone className="h-4 w-4 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Số điện thoại</p>
                  <p className="text-white">{selectedOwner.phone || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 flex items-center justify-center bg-indigo-900/50 rounded-lg mr-3">
                  <User className="h-4 w-4 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Username</p>
                  <p className="text-white">{selectedOwner.username}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setIsOwnerModalOpen(false)}
                className="px-4 py-2 bg-gray-800/70 text-gray-300 rounded-lg hover:bg-gray-700/70 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {isImageModalOpen && selectedSalon && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div
            className="relative max-w-4xl w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsImageModalOpen(false)}
              className="absolute top-4 right-4 text-white bg-gray-800/70 rounded-full p-2 hover:bg-gray-700/70"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="bg-gray-900 rounded-xl overflow-hidden">
              <img
                src={`http://localhost:8084/salon-images/${selectedSalon.images[selectedImageIndex]}`}
                alt={`Salon image ${selectedImageIndex + 1}`}
                className="w-full h-[60vh] object-contain"
              />
              {selectedSalon.images.length > 1 && (
                <div className="flex justify-between p-4">
                  <button
                    onClick={() =>
                      setSelectedImageIndex((prev) =>
                        prev === 0 ? selectedSalon.images.length - 1 : prev - 1
                      )
                    }
                    className="px-4 py-2 bg-gray-800/70 text-white rounded-lg hover:bg-gray-700/70"
                  >
                    Trước
                  </button>
                  <span className="text-gray-300">
                    {selectedImageIndex + 1} / {selectedSalon.images.length}
                  </span>
                  <button
                    onClick={() =>
                      setSelectedImageIndex((prev) =>
                        prev === selectedSalon.images.length - 1 ? 0 : prev + 1
                      )
                    }
                    className="px-4 py-2 bg-gray-800/70 text-white rounded-lg hover:bg-gray-700/70"
                  >
                    Sau
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isSuccessModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-gray-900 w-full max-w-md rounded-xl shadow-2xl border border-gray-800 p-6">
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
              Thành công
            </h3>
            <p className="text-gray-300 text-center mt-2">{modalMessage}</p>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setIsSuccessModalOpen(false)}
                className="px-4 py-2 bg-gray-800/70 text-gray-300 rounded-lg hover:bg-gray-700/70 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {isErrorModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-gray-900 w-full max-w-md rounded-xl shadow-2xl border border-gray-800 p-6">
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
            <h3 className="text-xl font-bold text-center text-red-400">Lỗi</h3>
            <p className="text-gray-300 text-center mt-2">{modalMessage}</p>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setIsErrorModalOpen(false)}
                className="px-4 py-2 bg-gray-800/70 text-gray-300 rounded-lg hover:bg-gray-700/70 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Salons;
