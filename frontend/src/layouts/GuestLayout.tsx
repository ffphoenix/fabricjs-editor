import { Outlet } from "react-router";

export default () => {
  return (
    <div className="flex items-center min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col flex-1 w-full">
        <Outlet />
      </div>
    </div>
  );
};
