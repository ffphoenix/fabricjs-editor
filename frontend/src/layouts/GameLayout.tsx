import React from "react";

import Header from "../components/header/Header";
import { Outlet } from "react-router";

const LayoutContent: React.FC = () => {
  return (
    <div className="w-full h-full min-h-screen">
      <Header />
      <Outlet />
    </div>
  );
};

export default LayoutContent;
