import React, { useState } from "react";
import { Link } from "react-router-dom";

const HeaderStaff = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Navigation items for staff
  const staffMenu = [
    {
      id: "booking",
      name: "Lịch làm việc",
      icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    },
  ];

  const [activeItem, setActiveItem] = useState("booking");

  return (
    <header className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
      <div className="max-w-full mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and Menu Toggle */}
          <div className="flex items-center">
            <button
              className="p-2 rounded-md text-white lg:hidden hover:bg-indigo-600 focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {/* Menu Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <div className="ml-2 lg:ml-0 flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-blue-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z"
                  />
                </svg>
                <div className="ml-2">
                  <span className="text-blue-300 font-bold text-xl">Staff</span>
                  <span className="text-white font-semibold text-xl">
                    Portal
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:ml-8 lg:flex lg:space-x-1">
              {staffMenu.map((item) => (
                <Link
                  key={item.id}
                  to={`/staff/${item.id}`}
                  onClick={() => setActiveItem(item.id)}
                  className={`${
                    activeItem === item.id
                      ? "border-blue-300 text-white"
                      : "border-transparent text-gray-200 hover:border-gray-300 hover:text-white"
                  } group flex items-center px-3 py-2 border-b-2 text-sm font-medium transition-colors`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-1.5 h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={item.icon}
                    />
                  </svg>
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right side - Profile */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <div className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white p-2 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              </button>

              {isProfileOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-3 px-4 border-b border-gray-100 bg-gray-50 rounded-t-md">
                    <p className="text-sm font-medium text-gray-800">
                      Staff Name
                    </p>
                    <p className="text-xs text-gray-500">staff@salon.com</p>
                  </div>
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <Link
                      to="/staff/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      role="menuitem"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-3 h-4 w-4 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Your Profile
                    </Link>
                    <Link
                      to="/logout"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center text-red-600 hover:text-red-700"
                      role="menuitem"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-3 h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Sign out
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`lg:hidden ${isMobileMenuOpen ? "block" : "hidden"}`}>
        <div className="pt-2 pb-3 space-y-1 bg-indigo-700 border-t border-indigo-600">
          {staffMenu.map((item) => (
            <Link
              key={item.id}
              to={`/staff/${item.id}`}
              onClick={() => setActiveItem(item.id)}
              className={`${
                activeItem === item.id
                  ? "bg-blue-600 text-white border-blue-300"
                  : "text-gray-200 hover:bg-blue-500 hover:text-white border-transparent"
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors`}
            >
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-3 h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={item.icon}
                  />
                </svg>
                {item.name}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
};

export default HeaderStaff;
