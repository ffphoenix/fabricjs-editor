import React from "react";

import Header from "../components/header/Header";
import { Outlet } from "react-router";

export default () => {
  return (
    <div className="min-h-screen xl:flex">
      <div className="flex-1">
        <Header />
        <div className="p-4 mx-auto max-w md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
