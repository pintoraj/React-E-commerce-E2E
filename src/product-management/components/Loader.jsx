import React from "react";
import "./Loader.css";

const Loader = () => {
  return (
    <div className="p-loader-wrapper">
      <div className="p-newtons-cradle">
        <div className="p-dot" />
        <div className="p-dot" />
        <div className="p-dot" />
        <div className="p-dot" />
      </div>
    </div>
  );
};

export default Loader;
