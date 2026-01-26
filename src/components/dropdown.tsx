import React from "react";


interface DropdownItem {
  label: string;
  link?: string;
}

interface DropdownProps {
  label: string;
  link?: string;
  items?: DropdownItem[];
}

const Dropdown: React.FC<DropdownProps> = ({ label, link = "#", items = [] }) => {
  return (
    <div className="dropdown">
      <a className="menuitem" href={link}>{label}</a>
      <div className="dropdown-content">
        <div className="dropdown-triangle"></div>
        <div className="dropdown-list">
          <ul>
            {items.map((item, index) => (
              <li key={index}>
                <a href={item.link || "#"}>{item.label}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dropdown;