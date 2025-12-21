import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const toggleMenu = () => setOpen(!open);

  const navItems = [
    { to: "/home", label: "Home" },
    { to: "/transactions", label: "Transactions" },
    { to: "/budgets", label: "Budgets" },
    { to: "/goals", label: "Goals" },
    { to: "/tips", label: "Tips" },
  ];

  return (
    <nav className="bg-white shadow-md px-4 py-3 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="text-xl font-bold text-indigo-600">Budget Buddy</div>

        <div className="md:hidden">
          <button onClick={toggleMenu}>
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <div className="hidden md:flex gap-6 items-center">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive
                  ? "text-indigo-600 font-medium"
                  : "text-gray-700 hover:text-indigo-600"
              }
            >
              {item.label}
            </NavLink>
          ))}
          {user && (
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Logout
            </button>
          )}
        </div>
      </div>

      {open && (
        <div className="md:hidden mt-3 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="block text-gray-700 px-2 py-1 hover:text-indigo-600"
            >
              {item.label}
            </NavLink>
          ))}
          {user && (
            <button
              onClick={() => {
                handleLogout();
                setOpen(false);
              }}
              className="block text-red-600 px-2 py-1"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;