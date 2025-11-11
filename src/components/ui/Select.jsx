import React from 'react';

const Select = ({ children, className, ...props }) => {
  return (
    <select
      className={`w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
};

export default Select;
