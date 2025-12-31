import React from "react";

import { Outlet } from "react-router";

const LayoutContent: React.FC = () => {
  return (
    <div className="w-full h-full min-h-screen">
      <Outlet />
    </div>
  );
};

export default LayoutContent;
