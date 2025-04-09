import React, { useState } from "react";
import { Link } from "react-router-dom"; // Import Link từ react-router-dom

const HeaderAdmin = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Services list for admin navigation
  const services = [
    {
      id: "booking",
      name: "Booking Service",
      icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
      isComplete: false,
    },
    {
      id: "category",
      name: "Category Service",
      icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z",
      isComplete: true,
    },
    {
      id: "payment",
      name: "Payment Service",
      icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z",
      isComplete: true,
    },
    {
      id: "salon",
      name: "Salon Service",
      icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
      isComplete: true,
    },
    {
      id: "service-offering",
      name: "Service Offering",
      icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
      isComplete: true,
    },
    {
      id: "user",
      name: "User Service",
      icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
      isComplete: true,
    },
  ];

  const [activeService, setActiveService] = useState("dashboard");

  return (
    <header className="bg-gradient-to-r from-purple-800 to-indigo-900 shadow-lg">
      <div className="max-w-full mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and Menu Toggle */}
          <div className="flex items-center">
            <button
              className="p-2 rounded-md text-white lg:hidden hover:bg-indigo-800 focus:outline-none"
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
                  className="h-8 w-8 text-pink-400"
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
                  <span className="text-pink-400 font-bold text-xl">
                    Beauty
                  </span>
                  <span className="text-white font-semibold text-xl">
                    Salon
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:ml-8 lg:flex lg:space-x-1">
              <Link
                to="/admin"
                onClick={() => setActiveService("dashboard")}
                className={`${
                  activeService === "dashboard"
                    ? "border-pink-400 text-white"
                    : "border-transparent text-gray-300 hover:border-gray-300 hover:text-white"
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
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                Dashboard
              </Link>

              {services.map((service) => (
                <Link
                  key={service.id}
                  to={`/admin/${service.id}`}
                  onClick={() => setActiveService(service.id)}
                  className={`${
                    activeService === service.id
                      ? "border-pink-400 text-white"
                      : "border-transparent text-gray-300 hover:border-gray-300 hover:text-white"
                  } group flex items-center px-3 py-2 border-b-2 text-sm font-medium transition-colors`}
                >
                  <div className="relative">
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
                        d={service.icon}
                      />
                    </svg>
                    {service.isComplete && (
                      <span className="absolute -top-1 -right-1 block h-2 w-2 rounded-full bg-green-400" />
                    )}
                  </div>
                  {service.name.split(" ")[0]}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right side - Search and User Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  className="block w-full pl-10 pr-3 py-2 border border-transparent rounded-md leading-5 bg-indigo-800 bg-opacity-25 text-white placeholder-gray-300 focus:outline-none focus:bg-indigo-700 focus:ring-0 focus:border-transparent sm:text-sm"
                  placeholder="Search services..."
                  type="search"
                />
              </div>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                className="p-2 rounded-full text-gray-200 hover:bg-indigo-800 focus:outline-none relative"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              >
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
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-pink-500 ring-2 ring-indigo-900" />
              </button>

              {isNotificationsOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-2 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-t-md">
                    <h3 className="text-sm font-semibold text-white">
                      System Notifications
                    </h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <div className="py-2 px-4 border-b border-gray-100 hover:bg-gray-50">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 pt-0.5">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-green-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            User Service update completed
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            30 minutes ago
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="py-2 px-4 border-b border-gray-100 hover:bg-gray-50">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 pt-0.5">
                          <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-yellow-600"
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
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            Booking Service needs attention
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            1 hour ago
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="py-2 px-4 hover:bg-gray-50">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 pt-0.5">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-blue-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            System maintenance scheduled
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Tomorrow at 2:00 AM
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="py-2 px-4 border-t border-gray-200 bg-gray-50 rounded-b-md">
                    <Link
                      to="/admin/notifications"
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-500 flex items-center"
                    >
                      <span>View all notifications</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="ml-1 h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-2 rounded-full">
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
                      Admin User
                    </p>
                    <p className="text-xs text-gray-500">admin@glamsalon.com</p>
                  </div>
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <Link
                      to="/admin/profile"
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
                      to="/admin/settings"
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
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Settings
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
        <div className="pt-2 pb-3 space-y-1 bg-indigo-900 border-t border-indigo-800">
          <Link
            to="/admin/dashboard"
            onClick={() => setActiveService("dashboard")}
            className={`${
              activeService === "dashboard"
                ? "bg-purple-700 text-white border-pink-400"
                : "text-gray-300 hover:bg-purple-800 hover:text-white border-transparent"
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
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Dashboard
            </div>
          </Link>

          {services.map((service) => (
            <Link
              key={service.id}
              to={`/admin/${service.id}`}
              onClick={() => setActiveService(service.id)}
              className={`${
                activeService === service.id
                  ? "bg-purple-700 text-white border-pink-400"
                  : "text-gray-300 hover:bg-purple-800 hover:text-white border-transparent"
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors`}
            >
              <div className="flex items-center">
                <div className="relative">
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
                      d={service.icon}
                    />
                  </svg>
                  {service.isComplete && (
                    <span className="absolute -top-1 -right-1 block h-2 w-2 rounded-full bg-green-400" />
                  )}
                </div>
                {service.name}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
};

export default HeaderAdmin;
