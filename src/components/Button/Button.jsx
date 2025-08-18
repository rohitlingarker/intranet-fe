import React from "react";
import classNames from "classnames";

const SIZE_CLASSES = {
  large: "text-base px-8 py-3",
  medium: "text-sm px-6 py-3",
  small: "text-xs px-3 py-1.5",
};

const VARIANT_CLASSES = {
  primary: "bg-indigo-900 text-white hover:bg-indigo-800",
  secondary: "bg-pink-800 text-white hover:bg-pink-800",
  success: "bg-green-600 text-white hover:bg-green-500",
  danger: "bg-red-600 text-white hover:bg-red-500",
  link: "bg-transparent shadow-none text-indigo-600 hover:text-indigo-800 border-none",
};

const Button = ({
  children,
  size = "medium",
  variant = "primary",
  className = "",
  ...props
}) => {
  const baseClasses =
    "rounded-xl font-semibold transition duration-200 focus:outline-none shadow-sm";

  return (
    <button
      className={classNames(
        baseClasses,
        SIZE_CLASSES[size],
        VARIANT_CLASSES[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
