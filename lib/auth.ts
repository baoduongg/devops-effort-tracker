"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { linkOrCreateUser } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";

export function useAuthListener(): void {
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }
      const appUser = await linkOrCreateUser(firebaseUser);
      setUser(appUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [setUser, setLoading]);
}
