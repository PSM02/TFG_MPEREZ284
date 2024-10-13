import React, { useState } from "react";

const DropDownList = ({ list, onSelect }) => {
  const [selected, setSelected] = useState(null);

  const handleSelect = (item) => {
    setSelected(item);
    onSelect(item);
  };

  return (
    <div className="dropdown">
      <button
        className="btn btn-secondary dropdown-toggle"
        type="button"
        id="dropdownMenu2"
        data-bs-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false"
      >
        {!selected ? "Dropdown" : selected.model}
      </button>
      <div className="dropdown-menu" aria-labelledby="dropdownMenu2">
        {list.map((item, index) => (
          <button
            key={index}
            className="dropdown-item"
            type="button"
            onClick={() => handleSelect(item)} // Call onSelect with the clicked item
          >
            {item.model}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DropDownList;
