"use client";

import { QueueEntryForm } from "@/components/QueueEntryForm";
import { Toaster } from "react-hot-toast";

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-white text-center mb-2">
          UTA Libraries
        </h1>
        <h1 className="text-2xl font-bold text-white text-center mb-8">
          Print and Design Studios
        </h1>
        <h1 className="text-4xl font-bold text-white text-center mb-12">
          Printing Queue
        </h1>
        <QueueEntryForm />
      </div>
      <Toaster position="top-center" />
    </main>
  );
}
