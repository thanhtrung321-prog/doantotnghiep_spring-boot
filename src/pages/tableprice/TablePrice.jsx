import React from "react";

const services = [
  { name: "Cắt tóc nam", price: "100.000đ" },
  { name: "Cắt tóc nữ", price: "150.000đ" },
  { name: "Gội đầu thư giãn", price: "70.000đ" },
  { name: "Nhuộm thời trang", price: "500.000đ ~ 1.200.000đ" },
  { name: "Uốn xoăn tự nhiên", price: "800.000đ ~ 1.500.000đ" },
  { name: "Duỗi tóc keratin", price: "900.000đ ~ 1.800.000đ" },
  { name: "Hấp dầu phục hồi", price: "150.000đ" },
  { name: "Chăm sóc da đầu", price: "200.000đ" },
];

const TablePrice = () => {
  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold text-amber-800 mb-4">
          Bảng Giá Dịch Vụ
        </h2>
        <p className="text-gray-600 text-lg mb-10">
          Tham khảo bảng giá dịch vụ của chúng tôi – minh bạch, rõ ràng, và xứng
          đáng với chất lượng.
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-xl">
            <thead>
              <tr className="bg-amber-800 text-white">
                <th className="text-left py-3 px-6">Dịch Vụ</th>
                <th className="text-left py-3 px-6">Giá</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service, index) => (
                <tr
                  key={index}
                  className={`${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-amber-50 transition`}
                >
                  <td className="py-3 px-6 text-gray-800 font-medium">
                    {service.name}
                  </td>
                  <td className="py-3 px-6 text-amber-700 font-semibold">
                    {service.price}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-gray-500 mt-6 italic text-sm">
          *Giá có thể thay đổi tùy theo độ dài và tình trạng tóc.
        </p>
      </div>
    </div>
  );
};

export default TablePrice;
