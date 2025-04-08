import React from "react";

const salon = {
  name: "Salon Tóc Đẹp VIP",
  address: "123 Đường Nguyễn Trãi, Quận 1",
  city: "TP. Hồ Chí Minh",
  email: "lienhe@salontocdep.vn",
  contact: "0909 123 456",
  opening_time: "08:00",
  closing_time: "20:00",
};

const SalonInfo = () => {
  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-amber-800 mb-6">
          Giới Thiệu Salon
        </h1>
        <div className="bg-gray-50 p-6 rounded-xl shadow-md">
          <p className="text-lg mb-2">
            <strong>Tên Salon:</strong> {salon.name}
          </p>
          <p className="text-lg mb-2">
            <strong>Địa chỉ:</strong> {salon.address}, {salon.city}
          </p>
          <p className="text-lg mb-2">
            <strong>Thời gian hoạt động:</strong> {salon.opening_time} -{" "}
            {salon.closing_time}
          </p>
          <p className="text-lg mb-2">
            <strong>Số điện thoại:</strong> {salon.contact}
          </p>
          <p className="text-lg">
            <strong>Email:</strong> {salon.email}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SalonInfo;
