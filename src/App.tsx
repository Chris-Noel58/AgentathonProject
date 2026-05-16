/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { Home, Settings, Shield } from "lucide-react";
import LandingPage from "./pages/LandingPage";
import AdminDashboard from "./pages/AdminDashboard";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./components/Login";
import Signup from "./components/Signup";
import { ReactNode } from "react";

import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  return currentUser ? <>{children}</> : <Navigate to="/login" />;
}

function Sidebar() {
  const location = useLocation();
  
  const links = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/admin", icon: Settings, label: "Admin" },
  ];

  return (
    <div className="w-64 bg-white text-gray-900 h-screen flex flex-col hidden md:flex border-r border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-[#006633] rounded-lg flex items-center justify-center">
          <Shield size={24} className="text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight tracking-tight text-[#111827]">Watchdog</h1>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Civic Platform</p>
        </div>
      </div>
      <nav className="flex-1 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive 
                ? "bg-gray-100 text-[#006633] font-semibold" 
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium"
              }`}
            >
              <Icon size={18} />
              <span className="text-sm">{link.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto">
        <div className="p-4 rounded-xl bg-[#006633] text-white">
          <div className="text-xs font-medium opacity-80 mb-1">Current Focus</div>
          <p className="text-sm font-bold">Kenya, National & County</p>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  return (
    <div className="flex h-screen bg-[#F9FAFB] font-sans text-[#111827] overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto flex flex-col">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
