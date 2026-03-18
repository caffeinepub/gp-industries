import type React from "react";
import { createContext, useContext } from "react";

const InternetIdentityContext = createContext({});

export function InternetIdentityProvider({
  children,
}: { children: React.ReactNode }) {
  return (
    <InternetIdentityContext.Provider value={{}}>
      {children}
    </InternetIdentityContext.Provider>
  );
}

export function useInternetIdentity() {
  return useContext(InternetIdentityContext);
}
