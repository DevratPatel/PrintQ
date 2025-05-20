"use client";

import { DeskPanel } from "@/components/DeskPanel";
import { Toaster } from "react-hot-toast";

export default function Desk2Page() {
  return (
    <>
      <DeskPanel desk="desk2" />
      <Toaster position="top-center" />
    </>
  );
}
