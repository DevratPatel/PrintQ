"use client";

import { DeskPanel } from "@/components/DeskPanel";
import { Toaster } from "react-hot-toast";

export default function Desk1Page() {
  return (
    <>
      <DeskPanel desk="desk1" />
      <Toaster position="top-center" />
    </>
  );
}
