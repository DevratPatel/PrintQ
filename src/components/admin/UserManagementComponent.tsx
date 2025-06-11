import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "../ui/GlassCard";
import {
  FiUsers,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiEyeOff,
  FiCopy,
  FiCheck,
  FiMail,
  FiShield,
  FiClock,
  FiX,
} from "react-icons/fi";
import { useAuth } from "@/contexts/AuthContext";
import {
  createUserAccount,
  getAllUsers,
  updateUserStatus,
  deleteUser,
} from "@/lib/userManagement";
import type { User, CreateUserRequest } from "@/types/user";
import toast from "react-hot-toast";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: (user: User, tempPassword: string) => void;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onUserCreated,
}) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "desk">("desk");
  const [isLoading, setIsLoading] = useState(false);
  const { user: currentUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsLoading(true);

    const userRequest: CreateUserRequest = { email, role };
    const result = await createUserAccount(userRequest, currentUser.uid);

    if (result.success && result.user && result.tempPassword) {
      onUserCreated(result.user, result.tempPassword);
      toast.success("User created successfully!");
      setEmail("");
      setRole("desk");
      onClose();
    } else {
      toast.error(result.error || "Failed to create user");
    }

    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl w-full max-w-md p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Create New User</h2>
          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Email Address
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter email address"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Role
            </label>
            <div className="relative">
              <FiShield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "admin" | "desk")}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                disabled={isLoading}
              >
                <option value="desk">Desk User</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <p className="text-white/50 text-xs mt-1">
              {role === "admin"
                ? "Full access to all features"
                : "Access to desk operations only"}
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {isLoading ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

interface TempPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  tempPassword: string;
}

const TempPasswordModal: React.FC<TempPasswordModalProps> = ({
  isOpen,
  onClose,
  user,
  tempPassword,
}) => {
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(tempPassword);
      setCopied(true);
      toast.success("Password copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy password");
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl w-full max-w-md p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            User Created Successfully
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <p className="text-green-400 font-medium mb-2">
              ✓ Account created for:
            </p>
            <p className="text-white">{user.email}</p>
            <p className="text-white/70 text-sm">Role: {user.role}</p>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <p className="text-yellow-400 font-medium mb-3">
              Temporary Password:
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-black/30 rounded px-3 py-2 font-mono text-sm">
                {showPassword ? tempPassword : "••••••••••••"}
              </div>
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="p-2 text-white/70 hover:text-white transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <FiEyeOff className="w-4 h-4" />
                ) : (
                  <FiEye className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={copyToClipboard}
                className="p-2 text-white/70 hover:text-white transition-colors"
                title="Copy password"
              >
                {copied ? (
                  <FiCheck className="w-4 h-4 text-green-400" />
                ) : (
                  <FiCopy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-blue-400 font-medium mb-2">📋 Instructions:</p>
            <ol className="text-white/70 text-sm space-y-1 list-decimal list-inside">
              <li>Share this temporary password with the user</li>
              <li>
                Send them this registration link: <br />
                <span className="font-mono text-blue-300 text-xs break-all">
                  {typeof window !== "undefined"
                    ? `${
                        window.location.origin
                      }/register?email=${encodeURIComponent(user.email)}`
                    : "/register"}
                </span>
              </li>
              <li>
                They will create their account using the temporary password
              </li>
              <li>
                They'll set their own permanent password during registration
              </li>
            </ol>
          </div>

          <button
            onClick={onClose}
            className="w-full px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            Got it!
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export const UserManagementComponent = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newUser, setNewUser] = useState<User | null>(null);
  const [newUserPassword, setNewUserPassword] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    const usersList = await getAllUsers();
    setUsers(usersList);
    setIsLoading(false);
  };

  const handleUserCreated = (user: User, tempPassword: string) => {
    setNewUser(user);
    setNewUserPassword(tempPassword);
    setShowPasswordModal(true);
    loadUsers(); // Refresh the list
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    const success = await updateUserStatus(userId, !currentStatus);
    if (success) {
      toast.success(
        `User ${!currentStatus ? "activated" : "deactivated"} successfully`
      );
      loadUsers();
    } else {
      toast.error("Failed to update user status");
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (
      !confirm(
        `Are you sure you want to delete user ${email}? This action cannot be undone.`
      )
    ) {
      return;
    }

    const success = await deleteUser(userId);
    if (success) {
      toast.success("User deleted successfully");
      loadUsers();
    } else {
      toast.error("Failed to delete user");
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span className="text-white/70">Loading users...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">User Management</h2>
          <p className="text-white/70">
            Manage user accounts and access permissions
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          Add New User
        </button>
      </div>

      {/* Users List */}
      <GlassCard>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 font-medium text-white/80">
                  User
                </th>
                <th className="text-left py-3 px-4 font-medium text-white/80">
                  Role
                </th>
                <th className="text-left py-3 px-4 font-medium text-white/80">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-medium text-white/80">
                  Created
                </th>
                <th className="text-left py-3 px-4 font-medium text-white/80">
                  Last Login
                </th>
                <th className="text-right py-3 px-4 font-medium text-white/80">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-white/5 hover:bg-white/5"
                >
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-white font-medium">{user.email}</p>
                      {user.isFirstLogin && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs mt-1">
                          <FiClock className="w-3 h-3" />
                          First login pending
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                        user.role === "admin"
                          ? "bg-purple-500/20 text-purple-400"
                          : "bg-blue-500/20 text-blue-400"
                      }`}
                    >
                      <FiShield className="w-3 h-3" />
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                        user.isActive
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white/70 text-sm">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="py-3 px-4 text-white/70 text-sm">
                    {user.lastLoginAt ? formatDate(user.lastLoginAt) : "Never"}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() =>
                          handleToggleStatus(user.id, user.isActive)
                        }
                        className={`p-2 rounded-lg transition-colors ${
                          user.isActive
                            ? "text-red-400 hover:bg-red-500/20"
                            : "text-green-400 hover:bg-green-500/20"
                        }`}
                        title={
                          user.isActive ? "Deactivate user" : "Activate user"
                        }
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id, user.email)}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                        title="Delete user"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <div className="text-center py-12">
              <FiUsers className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <p className="text-white/70 text-lg">No users found</p>
              <p className="text-white/50 text-sm">
                Create your first user to get started
              </p>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Modals */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateUserModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onUserCreated={handleUserCreated}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPasswordModal && (
          <TempPasswordModal
            isOpen={showPasswordModal}
            onClose={() => setShowPasswordModal(false)}
            user={newUser}
            tempPassword={newUserPassword}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
