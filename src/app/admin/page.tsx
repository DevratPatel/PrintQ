"use client";

import { AdminPanel } from "@/components/AdminPanel";
import { Toaster } from "react-hot-toast";

export default function AdminPage() {
  return (
    <>
      <AdminPanel />
      <Toaster position="top-center" />
    </>
  );
}
