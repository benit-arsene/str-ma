import { useCallback, useState } from "react";

import AdminAuthContext from "./AdminAuthContext";

export function AdminAuthProvider({ children }) {
  // In-memory UI state only. It is never persisted and is NOT proof of
  // authentication: the server validates the session cookie on every request,
  // and protected pages treat a 401 response as the authoritative logout.
  const [admin, setAdmin] = useState(null);

  const signIn = useCallback((adminUser) => {
    setAdmin(adminUser);
  }, []);

  const signOut = useCallback(() => {
    setAdmin(null);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ admin, signIn, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  );
}
