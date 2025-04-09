import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { 
  Search, Filter, Download, ChevronDown, 
  DollarSign, CreditCard, User, Calendar, 
  Bookmark, Store, CheckCircle, XCircle, Clock,
  BarChart2, PieChart, TrendingUp
} from 'lucide-react';

const Payments = () => {
  // Payment data state
  const [payments, setPayments] = useState([
    { 
      id: 1001, 
      amount: 850000, 
      booking_id: 5001, 
      payment_link_id: "plink_201", 
      payment_method: "credit_card", 
      salon_id: 301, 
      status: "completed", 
      user_id: 401,
      date: "2025-04-05T10:30:00"
    },
    { 
      id: 1002, 
      amount: 420000, 
      booking_id: 5002, 
      payment_link_id: "plink_202", 
      payment_method: "momo", 
      salon_id: 302, 
      status: "completed", 
      user_id: 402,
      date: "2025-04-07T14:15:00"
    },
    { 
      id: 1003, 
      amount: 650000, 
      booking_id: 5003, 
      payment_link_id: "plink_203", 
      payment_method: "bank_transfer", 
      salon_id: 301, 
      status: "pending", 
      user_id: 403,
      date: "2025-04-08T09:45:00"
    },
    { 
      id: 1004, 
      amount: 1200000, 
      booking_id: 5004, 
      payment_link_id: "plink_204", 
      payment_method: "zalopay", 
      salon_id: 303, 
      status: "failed", 
      user_id: 404,
      date: "2025-04-08T16:20:00"
    },
    { 
      id: 1005, 
      amount: 350000, 
      booking_id: 5005, 
      payment_link_id: "plink_205", 
      payment_method: "credit_card", 
      salon_id: 302, 
      status: "processing", 
      user_id: 405,
      date: "2025-04-09T11:10:00"
    },
    { 
      id: 1006, 
      amount: 780000, 
      booking_id: 5006, 
      payment_link_id: "plink_206", 
      payment_method: "momo", 
      salon_id: 303, 
      status: "completed", 
      user_id: 406,
      date: "2025-04-09T13:25:00"
    },
  ]);

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // Three.js related refs
  const threeContainerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const particlesRef = useRef([]);
  const raycasterRef = useRef(null);
  const mouseRef = useRef(new THREE.Vector2());
  const timeRef = useRef(0);
  const clickEffectRef = useRef(null);
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };
  
  // Get status style
  const getStatusStyle = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'processing':
        return 'bg-blue-100 text-blue-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };
  
  // Get payment method icon
  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'credit_card':
        return <CreditCard className="h-5 w-5" />;
      case 'momo':
        return <div className="h-5 w-5 bg-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">M</div>;
      case 'bank_transfer':
        return <DollarSign className="h-5 w-5" />;
      case 'zalopay':
        return <div className="h-5 w-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">Z</div>;
      default:
        return <DollarSign className="h-5 w-5" />;
    }
  };

  // Initialize Three.js scene
  useEffect(() => {
    if (!threeContainerRef.current) return;
    
    // Setup
    const width = threeContainerRef.current.clientWidth;
    const height = threeContainerRef.current.clientHeight;
    
    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 15;
    cameraRef.current = camera;
    
    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    threeContainerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    
    // Raycaster for mouse interaction
    raycasterRef.current = new THREE.Raycaster();
    
    // Create particles
    particlesRef.current = [];
    
    // Create unique colorful particles
    for (let i = 0; i < 300; i++) {
      const geometry = new THREE.SphereGeometry(0.08, 16, 16);
      
      // Create a beautiful shifting RGB color palette
      const hue = i / 300;
      const color = new THREE.Color().setHSL(hue, 0.8, 0.6);
      
      const material = new THREE.MeshPhongMaterial({
        color: color,
        emissive: color.clone().multiplyScalar(0.2),
        specular: 0xffffff,
        shininess: 50,
        transparent: true,
        opacity: 0.8
      });
      
      const particle = new THREE.Mesh(geometry, material);
      
      // Create a spherical distribution
      const phi = Math.acos(-1 + (2 * i) / 300);
      const theta = Math.sqrt(300 * Math.PI) * phi;
      
      const radius = 10;
      particle.position.x = radius * Math.cos(theta) * Math.sin(phi);
      particle.position.y = radius * Math.sin(theta) * Math.sin(phi);
      particle.position.z = radius * Math.cos(phi);
      
      particle.originalPosition = particle.position.clone();
      particle.originalScale = 1;
      
      scene.add(particle);
      particlesRef.current.push(particle);
    }
    
    // Create click effect container (particle system for click effect)
    const clickEffectGeometry = new THREE.BufferGeometry();
    const clickEffectMaterial = new THREE.PointsMaterial({ 
      size: 0.2,
      color: 0xffffff,
      transparent: true,
      blending: THREE.AdditiveBlending,
      opacity: 0.8
    });
    
    // Prepare the particles for the click effect (initially hidden)
    const particleCount = 50;
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
    }
    
    clickEffectGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const clickEffect = new THREE.Points(clickEffectGeometry, clickEffectMaterial);
    clickEffect.visible = false;
    scene.add(clickEffect);
    clickEffectRef.current = clickEffect;
    
    // Add some lights
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);
    
    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight1.position.set(1, 1, 1);
    scene.add(directionalLight1);
    
    const directionalLight2 = new THREE.DirectionalLight(0x8842ff, 1);
    directionalLight2.position.set(-1, -1, -1);
    scene.add(directionalLight2);
    
    // Mouse move handler
    const handleMouseMove = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / height) * 2 + 1;
    };
    
    // Mouse click handler - create explosion effect
    const handleMouseClick = (event) => {
      if (!sceneRef.current || !cameraRef.current || !clickEffectRef.current) return;
      
      // Get mouse position in normalized device coordinates
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / height) * 2 + 1;
      
      // Update the raycaster
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      
      // Find intersected objects
      const intersects = raycasterRef.current.intersectObjects(particlesRef.current);
      
      if (intersects.length > 0) {
        // Get the clicked position
        const clickPosition = intersects[0].point;
        
        // Update the click effect particles positions
        const positions = clickEffectRef.current.geometry.attributes.position.array;
        
        for (let i = 0; i < positions.length; i += 3) {
          // Set the origin of particles to the clicked position
          positions[i] = clickPosition.x;
          positions[i + 1] = clickPosition.y;
          positions[i + 2] = clickPosition.z;
          
          // Add random velocity direction
          clickEffectRef.current.userData.velocities = clickEffectRef.current.userData.velocities || [];
          clickEffectRef.current.userData.velocities[i / 3] = new THREE.Vector3(
            (Math.random() - 0.5) * 0.3,
            (Math.random() - 0.5) * 0.3,
            (Math.random() - 0.5) * 0.3
          );
        }
        
        // Make the effect visible
        clickEffectRef.current.visible = true;
        clickEffectRef.current.userData.age = 0;
        clickEffectRef.current.geometry.attributes.position.needsUpdate = true;
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleMouseClick);
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      timeRef.current += 0.01;
      
      // Animate particles
      particlesRef.current.forEach((particle, i) => {
        // Create a wave effect
        const offset = i * 0.01;
        const amp = 0.1;
        
        particle.position.x = particle.originalPosition.x + Math.sin(timeRef.current + offset) * amp;
        particle.position.y = particle.originalPosition.y + Math.cos(timeRef.current + offset) * amp;
        particle.position.z = particle.originalPosition.z + Math.sin(timeRef.current * 0.5 + offset) * amp;
        
        // Update color based on time
        if (particle.material) {
          const hue = (timeRef.current * 0.05 + i / particlesRef.current.length) % 1;
          particle.material.color.setHSL(hue, 0.8, 0.6);
          particle.material.emissive.setHSL(hue, 0.8, 0.2);
        }
      });
      
      // Handle click effect animation
      if (clickEffectRef.current && clickEffectRef.current.visible) {
        const positions = clickEffectRef.current.geometry.attributes.position.array;
        const velocities = clickEffectRef.current.userData.velocities || [];
        
        // Update particles
        for (let i = 0; i < positions.length; i += 3) {
          if (velocities[i / 3]) {
            positions[i] += velocities[i / 3].x;
            positions[i + 1] += velocities[i / 3].y;
            positions[i + 2] += velocities[i / 3].z;
          }
        }
        
        clickEffectRef.current.geometry.attributes.position.needsUpdate = true;
        
        // Age the effect
        clickEffectRef.current.userData.age = (clickEffectRef.current.userData.age || 0) + 1;
        
        // Fade out the effect
        clickEffectRef.current.material.opacity = Math.max(0, 0.8 - clickEffectRef.current.userData.age * 0.02);
        
        // Hide when completely faded
        if (clickEffectRef.current.userData.age > 40) {
          clickEffectRef.current.visible = false;
        }
      }
      
      // Raycaster interaction
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(particlesRef.current);
      
      // Reset all particles
      particlesRef.current.forEach(p => {
        p.scale.set(1, 1, 1);
        if (p.material) {
          p.material.opacity = 0.8;
        }
      });
      
      // Highlight intersected particles
      intersects.forEach(intersect => {
        const object = intersect.object;
        object.scale.set(1.5, 1.5, 1.5);
        if (object.material) {
          object.material.opacity = 1;
        }
      });
      
      controls.update();
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Handle window resize
    const handleResize = () => {
      if (!threeContainerRef.current) return;
      
      const width = threeContainerRef.current.clientWidth;
      const height = threeContainerRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleMouseClick);
      window.removeEventListener('resize', handleResize);
      
      if (threeContainerRef.current && rendererRef.current) {
        threeContainerRef.current.removeChild(rendererRef.current.domElement);
      }
      
      // Dispose all resources
      particlesRef.current.forEach(particle => {
        if (particle.geometry) particle.geometry.dispose();
        if (particle.material) particle.material.dispose();
      });
      
      if (clickEffectRef.current) {
        if (clickEffectRef.current.geometry) clickEffectRef.current.geometry.dispose();
        if (clickEffectRef.current.material) clickEffectRef.current.material.dispose();
      }
    };
  }, []);

  // View payment details
  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-900 text-white">
      {/* Three.js Background */}
      <div 
        ref={threeContainerRef} 
        className="fixed inset-0 -z-10" 
        aria-hidden="true"
      />
      
      <div className="container mx-auto px-4 py-10">
        {/* SEO Optimized Header */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 mb-4">
            Quản lý thanh toán
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Theo dõi và quản lý tất cả các giao dịch thanh toán từ khách hàng một cách hiệu quả với bảng điều khiển trực quan.
          </p>
        </header>
        
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-gradient-to-br from-purple-900/50 to-purple-600/30 p-6 rounded-2xl backdrop-blur-lg border border-purple-800/30 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <DollarSign className="h-8 w-8 text-purple-400" />
              </div>
              <div>
                <p className="text-purple-300 text-sm font-medium">Tổng doanh thu</p>
                <h2 className="text-2xl font-bold">{formatCurrency(payments.reduce((acc, payment) => acc + payment.amount, 0))}</h2>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-900/50 to-blue-600/30 p-6 rounded-2xl backdrop-blur-lg border border-blue-800/30 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <BarChart2 className="h-8 w-8 text-blue-400" />
              </div>
              <div>
                <p className="text-blue-300 text-sm font-medium">Tổng giao dịch</p>
                <h2 className="text-2xl font-bold">{payments.length}</h2>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-pink-900/50 to-pink-600/30 p-6 rounded-2xl backdrop-blur-lg border border-pink-800/30 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="bg-pink-500/20 p-3 rounded-lg">
                <TrendingUp className="h-8 w-8 text-pink-400" />
              </div>
              <div>
                <p className="text-pink-300 text-sm font-medium">Tỷ lệ thành công</p>
                <h2 className="text-2xl font-bold">
                  {Math.round((payments.filter(p => p.status === 'completed').length / payments.length) * 100)}%
                </h2>
              </div>
            </div>
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="w-full md:w-96 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm theo ID, phương thức thanh toán..."
              className="pl-10 pr-4 py-2 w-full bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-lg"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button className="flex items-center px-4 py-2 bg-gray-800/70 text-white rounded-lg hover:bg-gray-700/70 transition-colors backdrop-blur-lg border border-gray-700/50">
              <Filter className="h-5 w-5 mr-2" />
              Bộ lọc
              <ChevronDown className="h-4 w-4 ml-2" />
            </button>
            
            <button className="flex items-center px-4 py-2 bg-gray-800/70 text-white rounded-lg hover:bg-gray-700/70 transition-colors backdrop-blur-lg border border-gray-700/50">
              <Download className="h-5 w-5 mr-2" />
              Xuất báo cáo
            </button>
          </div>
        </div>
        
        {/* Payments Table */}
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden shadow-lg rounded-xl backdrop-blur-lg border border-gray-800">
              <table className="min-w-full divide-y divide-gray-800">
                <thead className="bg-gray-900/80">
                  <tr>
                    <th scope="col" className="py-4 px-3 text-left text-xs sm:text-sm font-medium text-gray-300 uppercase tracking-wider">ID</th>
                    <th scope="col" className="py-4 px-3 text-left text-xs sm:text-sm font-medium text-gray-300 uppercase tracking-wider">Booking ID</th>
                    <th scope="col" className="py-4 px-3 text-left text-xs sm:text-sm font-medium text-gray-300 uppercase tracking-wider">Người dùng</th>
                    <th scope="col" className="py-4 px-3 text-left text-xs sm:text-sm font-medium text-gray-300 uppercase tracking-wider">Số tiền</th>
                    <th scope="col" className="py-4 px-3 text-left text-xs sm:text-sm font-medium text-gray-300 uppercase tracking-wider">Phương thức</th>
                    <th scope="col" className="py-4 px-3 text-left text-xs sm:text-sm font-medium text-gray-300 uppercase tracking-wider">Salon</th>
                    <th scope="col" className="py-4 px-3 text-left text-xs sm:text-sm font-medium text-gray-300 uppercase tracking-wider">Trạng thái</th>
                    <th scope="col" className="py-4 px-3 text-left text-xs sm:text-sm font-medium text-gray-300 uppercase tracking-wider">Hành động</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800/50 divide-y divide-gray-800">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-700/30 transition-colors">
                      <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-white">{payment.id}</td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-300">{payment.booking_id}</td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-300">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-gray-400" />
                          {payment.user_id}
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-300">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                          {formatCurrency(payment.amount)}
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-300">
                        <div className="flex items-center">
                          {getPaymentMethodIcon(payment.payment_method)}
                          <span className="ml-2">{payment.payment_method}</span>
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-300">
                        <div className="flex items-center">
                          <Store className="h-4 w-4 mr-2 text-gray-400" />
                          {payment.salon_id}
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(payment.status)}`}>
                          {payment.status === 'completed' && <CheckCircle className="h-4 w-4 mr-1" />}
                          {payment.status === 'failed' && <XCircle className="h-4 w-4 mr-1" />}
                          {payment.status === 'pending' && <Clock className="h-4 w-4 mr-1" />}
                          {payment.status === 'processing' && <Clock className="h-4 w-4 mr-1" />}
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewDetails(payment)}
                          className="text-indigo-400 hover:text-indigo-300 mr-3"
                        >
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-400">
            Hiển thị <span className="font-medium text-white">1-6</span> của <span className="font-medium text-white">6</span> kết quả
          </div>
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-gray-800/70 text-white rounded-lg border border-gray-700/50 hover:bg-gray-700/70 transition-colors backdrop-blur-lg disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              Trước
            </button>
            <button className="px-4 py-2 bg-purple-600/60 text-white rounded-lg border border-purple-500/50 hover:bg-purple-500/60 transition-colors backdrop-blur-lg">
              1
            </button>
            <button className="px-4 py-2 bg-gray-800/70 text-white rounded-lg border border-gray-700/50 hover:bg-gray-700/70 transition-colors backdrop-blur-lg disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              Sau
            </button>
          </div>
        </div>
      </div>
      
      {/* Payment Detail Modal */}
      {isDetailModalOpen && selectedPayment && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black/60 backdrop-blur-sm" 
          onClick={() => setIsDetailModalOpen(false)}
        >
          <div 
            className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl max-w-2xl w-full mx-4 shadow-2xl border border-gray-700/50" 
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
              Chi tiết thanh toán #{selectedPayment.id}
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-800/60 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">ID</p>
                  <p className="text-white font-medium">{selectedPayment.id}</p>
                </div>
                
                <div className="bg-gray-800/60 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Số tiền</p>
                  <p className="text-white font-medium">{formatCurrency(selectedPayment.amount)}</p>
                </div>
                
                <div className="bg-gray-800/60 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Booking ID</p>
                  <p className="text-white font-medium">{selectedPayment.booking_id}</p>
                </div>
                
                <div className="bg-gray-800/60 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Payment Link ID</p>
                  <p className="text-white font-medium">{selectedPayment.payment_link_id}</p>
                </div>
                
                <div className="bg-gray-800/60 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Phương thức thanh toán</p>
                  <div className="flex items-center mt-1">
                    {getPaymentMethodIcon(selectedPayment.payment_method)}
                    <span className="ml-2 text-white font-medium">{selectedPayment.payment_method}</span>
                  </div>
                </div>
                
                <div className="bg-gray-800/60 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Salon ID</p>
                  <div className="flex items-center mt-1">
                    <Store className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-white font-medium">{selectedPayment.salon_id}</span>
                  </div>
                </div>
                
                <div className="bg-gray-800/60 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Trạng thái</p>
                  <span className={`mt-1 px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusStyle(selectedPayment.status)}`}>
                    {selectedPayment.status === 'completed' && <CheckCircle className="h-4 w-4 mr-1" />}
                    {selectedPayment.status === 'failed' && <XCircle className="h-4 w-4 mr-1" />}
                    {selectedPayment.status === 'pending' && <Clock className="h-4 w-4 mr-1" />}
                    {selectedPayment.status === 'processing' && <Clock className="h-4 w-4 mr-1" />}
                    {selectedPayment.status}
                  </span>
                </div>
                
                <div className="bg-gray-800/60 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Người dùng</p>
                  <div className="flex items-center mt-1">
                    <User className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-white font-medium">{selectedPayment.user_id}</span>
                  </div>
                </div>
                
                <div className="bg-gray-800/60 p-4 rounded-lg col-span-2">
                  <p className="text-gray-400 text-sm">Ngày thanh toán</p>
                  <div className="flex items-center mt-1">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-white font-medium">
                      {new Date(selectedPayment.date).toLocaleString('vi-VN', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors shadow-md"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;