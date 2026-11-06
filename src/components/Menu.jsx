import { useNavigate } from "react-router-dom";
import {
  House,
  CircleUserRound,
  LogOut
} from "lucide-react";
import { useAuth } from "../context/auth.js";

import "./Menu.css";

function Menu({ onClose }) {

  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleClick = (path) => {
    if (path === "/") signOut();
    navigate(path);

    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="menu">

      {/* Dashboard */}
      <div
        className="menu-item"
        onClick={() => handleClick("/dashboard")}
      >
        <House size={22} strokeWidth={2} />
        <span>Dashboard</span>
      </div>


      {/* Profile */}
      <div
        className="menu-item"
        onClick={() => handleClick("/profile")}
      >
        <CircleUserRound size={22} strokeWidth={2} />
        <span>Profile</span>
      </div>


      {/* Logout */}
      <div
        className="menu-item logout"
        onClick={() => handleClick("/")}
      >
        <LogOut size={22} strokeWidth={2} />
        <span>Logout</span>
      </div>

    </div>
  );
}

export default Menu;