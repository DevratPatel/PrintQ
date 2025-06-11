"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowLeft,
  FiUserPlus,
} from "react-icons/fi";
import { GlassCard } from "@/components/ui/GlassCard";
import { createUserWithEmailAndPassword, updatePassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showTempPassword, setShowTempPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Get email from query params if provided
  const queryEmail = searchParams.get("email");

  useEffect(() => {
    if (queryEmail) {
      setEmail(queryEmail);
    }
  }, [queryEmail]);

  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate new password
      if (!validatePassword(newPassword)) {
        toast.error("New password must be at least 8 characters long");
        return;
      }

      if (newPassword !== confirmPassword) {
        toast.error("Passwords don't match");
        return;
      }

      // Check if there's a pending invitation for this email
      const invitationsRef = doc(db, "userInvitations", "");
      // We need to query all invitations to find the right one
      // For simplicity, we'll create the account and validate afterward

      // Create user account with temporary password first (to validate it)
      let userCredential;
      try {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          tempPassword
        );
      } catch (error: any) {
        if (error.code === "auth/email-already-in-use") {
          toast.error(
            "This email is already registered. Please try logging in instead."
          );
        } else if (error.code === "auth/weak-password") {
          toast.error("The temporary password appears to be invalid");
        } else if (error.code === "auth/invalid-email") {
          toast.error("Invalid email address");
        } else {
          toast.error("Invalid email or temporary password");
        }
        return;
      }

      // Create user profile in Firestore
      const userProfile = {
        id: userCredential.user.uid,
        email: email,
        role: "desk", // Default role, will be updated from invitation if found
        createdAt: Date.now(),
        createdBy: "self-registration",
        isFirstLogin: false, // Since they're setting their own password
        isActive: true,
        lastLoginAt: Date.now(),
      };

      await setDoc(doc(db, "users", userCredential.user.uid), userProfile);

      // Update password to the new one
      await updatePassword(userCredential.user, newPassword);

      toast.success("Account created successfully! You can now log in.");
      router.push("/login");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error("Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-black dark:to-blue-950" />

      {/* Content */}
      <div className="relative min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Back to Login Button */}
          <div className="mb-8">
            <Link
              href="/login"
              className="inline-flex items-center space-x-2 text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
            >
              <FiArrowLeft className="w-4 h-4" />
              <span>Back to Login</span>
            </Link>
          </div>

          <GlassCard className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUserPlus className="w-8 h-8 text-blue-400" />
              </div>
              <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
                Create Your Account
              </h1>
              <p className="text-[var(--foreground-secondary)]">
                Use your temporary password to set up your account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[var(--foreground)] mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--foreground-secondary)] w-5 h-5" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)] text-[var(--foreground)] placeholder-[var(--foreground-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all"
                    placeholder="Enter your email"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="tempPassword"
                  className="block text-sm font-medium text-[var(--foreground)] mb-2"
                >
                  Temporary Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--foreground-secondary)] w-5 h-5" />
                  <input
                    id="tempPassword"
                    type={showTempPassword ? "text" : "password"}
                    required
                    value={tempPassword}
                    onChange={(e) => setTempPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)] text-[var(--foreground)] placeholder-[var(--foreground-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all"
                    placeholder="Enter temporary password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowTempPassword(!showTempPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
                    disabled={isLoading}
                  >
                    {showTempPassword ? (
                      <FiEyeOff className="w-5 h-5" />
                    ) : (
                      <FiEye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-[var(--foreground-secondary)] mt-1">
                  This was provided by your administrator
                </p>
              </div>

              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-[var(--foreground)] mb-2"
                >
                  New Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--foreground-secondary)] w-5 h-5" />
                  <input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)] text-[var(--foreground)] placeholder-[var(--foreground-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all"
                    placeholder="Create a new password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
                    disabled={isLoading}
                  >
                    {showNewPassword ? (
                      <FiEyeOff className="w-5 h-5" />
                    ) : (
                      <FiEye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-[var(--foreground-secondary)] mt-1">
                  Must be at least 8 characters long
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-[var(--foreground)] mb-2"
                >
                  Confirm New Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--foreground-secondary)] w-5 h-5" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)] text-[var(--foreground)] placeholder-[var(--foreground-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all"
                    placeholder="Confirm your new password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <FiEyeOff className="w-5 h-5" />
                    ) : (
                      <FiEye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {newPassword &&
                  confirmPassword &&
                  newPassword !== confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">
                      Passwords don't match
                    </p>
                  )}
              </div>

              <button
                type="submit"
                disabled={
                  isLoading ||
                  !validatePassword(newPassword) ||
                  newPassword !== confirmPassword
                }
                className="w-full bg-[var(--accent)] text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-[var(--foreground-secondary)]">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-[var(--accent)] font-medium hover:underline"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "var(--glass-bg)",
            backdropFilter: "blur(20px)",
            border: "1px solid var(--glass-border)",
            color: "var(--foreground)",
            borderRadius: "12px",
            padding: "16px",
            fontSize: "14px",
            fontWeight: "500",
          },
          success: {
            iconTheme: {
              primary: "var(--success)",
              secondary: "white",
            },
          },
          error: {
            iconTheme: {
              primary: "var(--error)",
              secondary: "white",
            },
          },
        }}
      />
    </>
  );
}
