import React from "react";

type Props = {
  label: string;
  active?: boolean;
  onClick?: () => void;
};

const ToolButton: React.FC<Props> = ({ label, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3 py-1 rounded border text-sm ${
      active
        ? "bg-blue-600 text-white border-blue-700"
        : "bg-white border-gray-300 text-gray-800 hover:bg-gray-50"
    }`}
  >
    {label}
  </button>
);

export default ToolButton;
