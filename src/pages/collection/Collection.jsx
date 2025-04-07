import React from "react";

const Collection = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h3 className="text-3xl font-bold text-amber-800 mb-2">
          Bộ Sưu Tập Mẫu Tóc
        </h3>
        <div className="w-24 h-1 bg-amber-600 mx-auto"></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="h-64 bg-amber-200 rounded-lg overflow-hidden">
          <div className="w-full h-full bg-amber-300 hover:opacity-90 transition"></div>
        </div>
        <div className="h-64 bg-amber-200 rounded-lg overflow-hidden">
          <div className="w-full h-full bg-amber-400 hover:opacity-90 transition"></div>
        </div>
        <div className="h-64 bg-amber-200 rounded-lg overflow-hidden">
          <div className="w-full h-full bg-amber-500 hover:opacity-90 transition"></div>
        </div>
        <div className="h-64 bg-amber-200 rounded-lg overflow-hidden">
          <div className="w-full h-full bg-amber-600 hover:opacity-90 transition"></div>
        </div>
      </div>

      <div className="text-center mt-8">
        <button className="border-2 border-amber-800 text-amber-800 px-6 py-2 rounded-full font-medium hover:bg-amber-800 hover:text-white transition">
          Xem Thêm
        </button>
      </div>
    </div>
  );
};

export default Collection;
