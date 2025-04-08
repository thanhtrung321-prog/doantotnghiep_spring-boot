import React from "react";

const services = [
  {
    title: "Cắt Tóc Nam/Nữ",
    description:
      "Kiểu tóc hiện đại, phù hợp với khuôn mặt và phong cách cá nhân.",
    image: "/images/cut-hair.jpg",
  },
  {
    title: "Uốn Tóc",
    description:
      "Uốn xoăn tự nhiên, bồng bềnh giữ nếp lâu dài, an toàn cho tóc.",
    image: "/images/curl-hair.jpg",
  },
  {
    title: "Nhuộm Thời Trang",
    description:
      "Màu sắc nổi bật, tôn da và cá tính với công nghệ nhuộm mới nhất.",
    image: "/images/dye-hair.jpg",
  },
];

const ServiceOverring = () => {
  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold text-amber-800 mb-4">
          Dịch Vụ Nổi Bật
        </h2>
        <p className="text-gray-600 text-lg mb-12">
          Khám phá những dịch vụ được ưa chuộng nhất tại salon của chúng tôi.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition"
            >
              <img
                src={service.image}
                alt={service.title}
                className="w-full h-56 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-amber-800 mb-2">
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <button className="bg-amber-800 text-white px-4 py-2 rounded-full hover:bg-amber-700 transition">
                  Đặt Lịch Ngay
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServiceOverring;
