const CheckBoxList = ({ items, checkedItems, setCheckedItems }) => {
  const handleChange = (event) => {
    const { name, checked } = event.target;
    if (!checked) {
      //remove name from the checkedItems list
      const newCheckedItems = { ...checkedItems };
      delete newCheckedItems[name];
      setCheckedItems(newCheckedItems);
    } else {
      //add name to the checkedItems list
      setCheckedItems({ ...checkedItems, [name]: true });
    }
  };

  return (
    <div className="checkbox-list">
      {items.map((item, index) => (
        <div key={index} className="checkbox-item">
          <label>
            <input
              type="checkbox"
              name={item}
              checked={checkedItems[item] || false}
              onChange={handleChange}
            />
            {item}
          </label>
        </div>
      ))}
    </div>
  );
};

export default CheckBoxList;
