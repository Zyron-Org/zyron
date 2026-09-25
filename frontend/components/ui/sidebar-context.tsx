"use client";

import * as React from "react";

interface SidebarContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggle: () => void;
  close: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  toggleCollapse: () => void;
}

const SidebarContext = React.createContext<SidebarContextType>({
  isOpen: false,
  setIsOpen: () => {},
  toggle: () => {},
  close: () => {},
  isCollapsed: false,
  setIsCollapsed: () => {},
  toggleCollapse: () => {},
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const toggle = React.useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const close = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleCollapse = React.useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        setIsOpen,
        toggle,
        close,
        isCollapsed,
        setIsCollapsed,
        toggleCollapse,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return React.useContext(SidebarContext);
}
