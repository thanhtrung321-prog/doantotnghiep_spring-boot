import React, { useEffect, useRef, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Calendar,
  Users,
  DollarSign,
  Scissors,
  TrendingUp,
  Clock,
  Award,
} from "lucide-react";
import * as THREE from "three";

const Dashboard = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const threeJsContainerRef = useRef(null);

  // Mock data phong phú hơn
  const revenueData = [
    { name: "T1", revenue: 4000, profit: 2400, customers: 20 },
    { name: "T2", revenue: 3000, profit: 1398, customers: 15 },
    { name: "T3", revenue: 7000, profit: 3800, customers: 30 },
    { name: "T4", revenue: 5000, profit: 3908, customers: 25 },
    { name: "T5", revenue: 6000, profit: 4800, customers: 35 },
    { name: "T6", revenue: 8000, profit: 3800, customers: 40 },
    { name: "T7", revenue: 9000, profit: 4300, customers: 45 },
    { name: "T8", revenue: 8500, profit: 4100, customers: 38 },
    { name: "T9", revenue: 7500, profit: 3600, customers: 32 },
    { name: "T10", revenue: 10000, profit: 5000, customers: 50 },
    { name: "T11", revenue: 9500, profit: 4700, customers: 48 },
    { name: "T12", revenue: 11000, profit: 5500, customers: 55 },
  ];

  const serviceData = [
    { name: "Cắt tóc", value: 35, revenue: 3500000 },
    { name: "Nhuộm", value: 25, revenue: 5000000 },
    { name: "Uốn", value: 20, revenue: 4000000 },
    { name: "Spa tóc", value: 15, revenue: 3000000 },
    { name: "Khác", value: 5, revenue: 500000 },
  ];

  const COLORS = ["#FF8042", "#FFBB28", "#00C49F", "#0088FE", "#FF6384"];

  const dailyCustomers = [
    { name: "T2", customers: 20, appointments: 15 },
    { name: "T3", customers: 15, appointments: 12 },
    { name: "T4", customers: 25, appointments: 20 },
    { name: "T5", customers: 30, appointments: 25 },
    { name: "T6", customers: 40, appointments: 35 },
    { name: "T7", customers: 55, appointments: 50 },
    { name: "CN", customers: 35, appointments: 30 },
  ];

  // Stats cards data
  const stats = [
    {
      title: "Doanh thu hôm nay",
      value: "8.900.000đ",
      icon: <DollarSign size={24} />,
      change: "+15%",
      color: "bg-orange-100 text-orange-600",
    },
    {
      title: "Khách hàng hôm nay",
      value: "27",
      icon: <Users size={24} />,
      change: "+5%",
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Đặt lịch mới",
      value: "12",
      icon: <Calendar size={24} />,
      change: "+2%",
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Dịch vụ hot",
      value: "Uốn xoăn",
      icon: <Scissors size={24} />,
      change: "",
      color: "bg-purple-100 text-purple-600",
    },
  ];

  // Top stylists mock data
  const topStylists = [
    {
      name: "Nguyễn Văn A",
      role: "Senior Stylist",
      revenue: "12.5tr",
      appointments: 45,
      rating: 4.8,
      img: "https://via.placeholder.com/40",
    },
    {
      name: "Trần Thị B",
      role: "Color Expert",
      revenue: "10.8tr",
      appointments: 38,
      rating: 4.7,
      img: "https://via.placeholder.com/40",
    },
    {
      name: "Lê Văn C",
      role: "Stylist",
      revenue: "8.2tr",
      appointments: 30,
      rating: 4.5,
      img: "https://via.placeholder.com/40",
    },
    {
      name: "Phạm Thị D",
      role: "Junior Stylist",
      revenue: "6.5tr",
      appointments: 25,
      rating: 4.3,
      img: "https://via.placeholder.com/40",
    },
  ];

  // Mouse move effect
  useEffect(() => {
    const handleMouseMove = (event) => {
      setMousePosition({
        x: event.clientX / window.innerWidth - 0.5,
        y: event.clientY / window.innerHeight - 0.5,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Three.js animation
  useEffect(() => {
    if (!threeJsContainerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 300 / 200, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(300, 200);
    threeJsContainerRef.current.innerHTML = "";
    threeJsContainerRef.current.appendChild(renderer.domElement);

    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 500;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 5;
    }
    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(posArray, 3)
    );
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      color: 0xff8c00,
      transparent: true,
      opacity: 0.8,
    });
    const particlesMesh = new THREE.Points(
      particlesGeometry,
      particlesMaterial
    );
    scene.add(particlesMesh);

    const sphereGeometry = new THREE.SphereGeometry(0.8, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0xff8c00,
      transparent: true,
      opacity: 0.3,
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphere);

    camera.position.z = 5;

    const animate = () => {
      requestAnimationFrame(animate);
      particlesMesh.rotation.x += 0.001;
      particlesMesh.rotation.y += 0.001;
      sphere.rotation.y += 0.005;
      renderer.render(scene, camera);
    };
    animate();

    return () => renderer.dispose();
  }, []);

  const getTransformStyle = () => ({
    transform: `perspective(1000px) rotateY(${
      mousePosition.x * 5
    }deg) rotateX(${-mousePosition.y * 5}deg)`,
  });

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200">
          <p className="font-bold text-gray-700">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value.toLocaleString()}${
                entry.name === "revenue" || entry.name === "profit" ? "đ" : ""
              }`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Dashboard Salon Tóc
        </h1>
        <div className="bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-orange-600 transition-all cursor-pointer flex items-center">
          <TrendingUp size={16} className="mr-2" />
          Báo cáo chi tiết
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`${stat.color} p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer`}
            style={getTransformStyle()}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium opacity-80">{stat.title}</p>
                <p className="text-2xl font-bold mt-2">{stat.value}</p>
                {stat.change && (
                  <p className="mt-2 text-xs font-medium">
                    {stat.change.includes("-") ? (
                      <span className="text-red-600">
                        {stat.change} so với hôm qua
                      </span>
                    ) : (
                      <span className="text-green-600">
                        {stat.change} so với hôm qua
                      </span>
                    )}
                  </p>
                )}
              </div>
              <div className="p-3 rounded-full bg-white bg-opacity-30">
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Chart */}
        <div
          className="bg-white p-6 rounded-lg shadow-md col-span-2 hover:shadow-lg transition-all duration-300"
          style={getTransformStyle()}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-700">
              Doanh thu theo tháng
            </h2>
            <div className="flex space-x-2">
              <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-medium cursor-pointer hover:bg-orange-200">
                Năm
              </span>
              <span className="px-3 py-1 bg-orange-500 text-white rounded-full text-xs font-medium cursor-pointer">
                Tháng
              </span>
              <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-medium cursor-pointer hover:bg-orange-200">
                Tuần
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f0f0f0"
              />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis
                axisLine={false}
                tickLine={false}
                width={80}
                tickFormatter={(value) => `${value / 1000}tr`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="revenue"
                name="Doanh thu"
                fill="#ff8c00"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="profit"
                name="Lợi nhuận"
                fill="#ff6b1a"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Service Distribution */}
        <div
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
          style={getTransformStyle()}
        >
          <h2 className="text-lg font-bold text-gray-700 mb-6">
            Phân bổ dịch vụ
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={serviceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {serviceData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name, props) => [
                  `${value}%`,
                  `${props.payload.revenue.toLocaleString()}đ`,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Lower Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Customers */}
        <div
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
          style={getTransformStyle()}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-700">
              Lượng khách hàng
            </h2>
            <Clock size={20} className="text-orange-500" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dailyCustomers}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f0f0f0"
              />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="customers"
                name="Khách hàng"
                stroke="#ff8c00"
                activeDot={{ r: 8 }}
                strokeWidth={3}
              />
              <Line
                type="monotone"
                dataKey="appointments"
                name="Lượt đặt lịch"
                stroke="#00C49F"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* ThreeJS Animation */}
        <div
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex flex-col"
          style={getTransformStyle()}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-700">
              Biểu đồ tương tác
            </h2>
            <Award size={20} className="text-orange-500" />
          </div>
          <div
            className="flex-1 flex justify-center items-center"
            ref={threeJsContainerRef}
          ></div>
        </div>

        {/* Top Stylists */}
        <div
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
          style={getTransformStyle()}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-700">
              Stylists xuất sắc
            </h2>
            <Award size={20} className="text-orange-500" />
          </div>
          <div className="space-y-4">
            {topStylists.map((stylist, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-orange-50 transition-all cursor-pointer"
              >
                <div className="flex items-center">
                  <img
                    src={stylist.img}
                    className="w-10 h-10 rounded-full mr-3"
                    alt={stylist.name}
                  />
                  <div>
                    <p className="font-medium text-gray-800">{stylist.name}</p>
                    <p className="text-xs text-gray-500">{stylist.role}</p>
                    <p className="text-xs text-orange-500">
                      Đánh giá: {stylist.rating}/5
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-orange-500 font-semibold">
                    {stylist.revenue}
                  </p>
                  <p className="text-xs text-gray-500">
                    {stylist.appointments} lịch
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
