import { Link } from "react-router";
import { ThemeToggleButton } from "../common/ThemeToggleButton";
import UserDropdown from "./UserDropdown";

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 flex w-auto bg-white border-gray-200 dark:border-gray-800 dark:bg-gray-900 lg:border-b">
      <div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">
        <div className="flex items-center justify-normal w-full gap-2 px-3 py-3 border-b border-gray-200 dark:border-gray-800 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">
          <Link to="/">
            <img className="dark:hidden" src="/images/logo/logo.svg" alt="Logo" />
            <img className="hidden dark:block" src="/images/logo/logo-dark.svg" alt="Logo" />
          </Link>
          <Link to="">Home</Link>
          <Link to="/game/1">Game</Link>
          <div className="flex gap-2 2xsm:gap-3 ml-auto">
            {/* <!-- Dark Mode Toggler --> */}
            <ThemeToggleButton />
            {/* <!-- Dark Mode Toggler --> */}
            {/* <!-- Notification Menu Area --> */}
          </div>
          {/* <!-- User Area --> */}
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default Header;
