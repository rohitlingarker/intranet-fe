import React from "react";

const Loader = () => {
  return (
    <div className="flex justify-center items-center py-10">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-black"></div>
    </div>
  );
};

export default Loader;
