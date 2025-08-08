import React from "react";

const LoadingState = () => {
  return (
    <div className="flex flex-col justify-center items-center gap-4 m-auto h-full mt-[40px]">
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#6A685D] border-dotted"></div>
      <div className="justify-start text-[#6A685D] text-sm font-medium font-inter leading-tight italic">
        Getting your database linked... hang in there!
      </div>
    </div>
  );
};

export default LoadingState;
