import React, { useState, useEffect } from "react";

const Loadingowner = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 1500; // 1.5 seconds
    const interval = 16; // ~60fps
    const increment = 100 / (duration / interval);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return Math.min(prev + increment, 100);
      });
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-purple-100">
      {/* Logo Section */}
      <div className="mb-8 text-center">
        <img
          src="http://hrsoftbd.com/assets/servicePhoto/imageprocessingmlead_20221108144006.gif"
          alt="Hair Salon Logo"
          className="w-24 h-24 mx-auto mb-4 rounded-full shadow-lg animate-pulse"
        />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Hair Salon</h1>
        <p className="text-gray-600">Đang tải...</p>
      </div>

      {/* Progress Section */}
      <div className="w-80 max-w-sm">
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4 shadow-inner">
          <div
            className="bg-gradient-to-r from-pink-400 to-purple-500 h-3 rounded-full transition-all duration-75 ease-out shadow-sm"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Running Character */}
        <div className="relative w-full h-16 mb-4">
          <div
            className="absolute transition-all duration-75 ease-out"
            style={{
              left: `${progress}%`,
              transform: "translateX(-50%)",
            }}
          >
            <img
              src="https://c.tenor.com/WBXa6Ot2nHIAAAAC/boy-running.gif"
              alt="Running"
              className="w-12 h-12"
            />
          </div>
        </div>

        {/* Progress Text */}
        <div className="text-center">
          <span className="text-lg font-semibold text-gray-700">
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="mt-8 flex space-x-2">
        <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
        <div
          className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
          style={{ animationDelay: "0.1s" }}
        ></div>
        <div
          className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"
          style={{ animationDelay: "0.2s" }}
        ></div>
      </div>
    </div>
  );
};

export default Loadingowner;
