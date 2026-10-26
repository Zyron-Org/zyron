"use client";

import * as React from "react";

export function Web3ErrorHandler() {
  React.useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const msg = event.reason?.message || (typeof event.reason === "string" ? event.reason : "");
      if (
        typeof msg === "string" &&
        (msg.includes("MetaMask") ||
          msg.includes("inpage.js") ||
          msg.includes("Failed to connect") ||
          msg.includes("evmAsk") ||
          msg.includes("extension not found"))
      ) {
        event.preventDefault(); // Silence background third-party extension errors
      }
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    return () => window.removeEventListener("unhandledrejection", handleUnhandledRejection);
  }, []);

  return null;
}
