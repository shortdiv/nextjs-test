"use client";

import { useState } from "react";

interface AlertProps {
  message: string;
  variant?: "info" | "success" | "warning" | "error";
  dismissible?: boolean;
}

const variantStyles = {
  info: "border-blue-200 bg-blue-50 text-blue-800",
  success: "border-green-200 bg-green-50 text-green-800",
  warning: "border-yellow-200 bg-yellow-50 text-yellow-800",
  error: "border-red-200 bg-red-50 text-red-800",
};

const variantIcons = {
  info: "ℹ",
  success: "✓",
  warning: "⚠",
  error: "✕",
};

export function Alert({ message, variant = "info", dismissible = false }: AlertProps) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div
      role="alert"
      className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm ${variantStyles[variant]}`}
    >
      <span className="text-base">{variantIcons[variant]}</span>
      <p className="flex-1">{message}</p>
      {dismissible && (
        <button
          onClick={() => setVisible(false)}
          className="ml-auto cursor-pointer opacity-60 hover:opacity-100"
          aria-label="Dismiss"
        >
          ✕
        </button>
      )}
    </div>
  );
}
