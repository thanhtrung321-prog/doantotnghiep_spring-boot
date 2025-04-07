import React from "react";

const CustomerReviews = () => {
  return (
    <div className="bg-amber-800 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-white mb-2">
            Khách Hàng Nói Gì Về Chúng Tôi
          </h3>
          <div className="w-24 h-1 bg-white mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-amber-200 mr-4"></div>
              <div>
                <h4 className="font-semibold">Nguyễn Thị Minh</h4>
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-gray-600">
              "Dịch vụ tuyệt vời, nhân viên thân thiện và chuyên nghiệp. Tôi rất
              hài lòng với kiểu tóc mới của mình!"
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-amber-200 mr-4"></div>
              <div>
                <h4 className="font-semibold">Trần Văn Nam</h4>
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-gray-600">
              "Kiểu tóc mới của tôi rất phù hợp với khuôn mặt. Cảm ơn stylist đã
              tư vấn nhiệt tình và chuyên nghiệp!"
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-amber-200 mr-4"></div>
              <div>
                <h4 className="font-semibold">Lê Thị Hương</h4>
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-gray-600">
              "Dịch vụ spa tóc ở đây thực sự tuyệt vời. Tóc tôi mềm mượt và khỏe
              mạnh hơn rất nhiều sau liệu trình."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerReviews;
