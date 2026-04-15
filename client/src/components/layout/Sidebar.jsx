import { CalendarDays, Clock, Users } from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/event-types", label: "Event Types", icon: CalendarDays },
  { to: "/availability", label: "Availability", icon: Clock },
  { to: "/meetings", label: "Meetings", icon: Users },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="brand-block">
          <div className="brand-mark">C</div>
          <div className="sidebar-brand-copy">
            <p className="eyebrow">Calendo</p>
          </div>
        </div>

        <div className="sidebar-profile">
          <div className="profile-avatar">A</div>
          <div>
            <strong className="profile-name">Anshul Chauhan</strong>
            <span className="profile-email">anch51004@gmail.com</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive ? "sidebar-link sidebar-link-active" : "sidebar-link"
            }
          >
            <item.icon className="sidebar-link-icon" size={18} strokeWidth={2.1} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
