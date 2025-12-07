'use client'

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoginPage from "./login/page";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Cek jika user sudah login, redirect ke dashboard
    const user = sessionStorage.getItem('user');
    if (user) {
      router.push('/dashboard');
    }
  }, [router]); // Remove 'supabase' from dependency

  return <LoginPage />;
}