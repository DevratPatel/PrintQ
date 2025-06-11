import {
  createUserWithEmailAndPassword,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  getDoc,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import type { User, CreateUserRequest } from "@/types/user";

// Generate a random temporary password
export const generateTempPassword = (): string => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  const length = 12;
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Create a user invitation (they'll need to register with the temp password)
export const createUserAccount = async (
  userRequest: CreateUserRequest,
  adminId: string
): Promise<{
  success: boolean;
  user?: User;
  tempPassword?: string;
  error?: string;
}> => {
  try {
    const tempPassword = generateTempPassword();

    // Check if user already exists
    const existingUsers = await getAllUsers();
    const existingUser = existingUsers.find(
      (u) => u.email === userRequest.email
    );

    if (existingUser) {
      return {
        success: false,
        error: "User with this email already exists",
      };
    }

    // Create a user invitation record
    const userId = `invite_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const user: User = {
      id: userId,
      email: userRequest.email,
      role: userRequest.role,
      createdAt: Date.now(),
      createdBy: adminId,
      isFirstLogin: true,
      isActive: true,
      tempPassword: tempPassword, // Store temporarily for admin to see
    };

    // Store user invitation in Firestore (they'll register themselves)
    await setDoc(doc(db, "userInvitations", userId), user);

    return { success: true, user, tempPassword };
  } catch (error: any) {
    console.error("Error creating user invitation:", error);
    return {
      success: false,
      error: error.message || "Failed to create user invitation",
    };
  }
};

// Get all users
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    const users: User[] = [];
    snapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() } as User);
    });

    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

// Update user status
export const updateUserStatus = async (
  userId: string,
  isActive: boolean
): Promise<boolean> => {
  try {
    await updateDoc(doc(db, "users", userId), { isActive });
    return true;
  } catch (error) {
    console.error("Error updating user status:", error);
    return false;
  }
};

// Delete user
export const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, "users", userId));
    return true;
  } catch (error) {
    console.error("Error deleting user:", error);
    return false;
  }
};

// Mark user as no longer first login
export const markFirstLoginComplete = async (
  userId: string
): Promise<boolean> => {
  try {
    await updateDoc(doc(db, "users", userId), {
      isFirstLogin: false,
      lastLoginAt: Date.now(),
      tempPassword: null, // Remove temp password from storage
    });
    return true;
  } catch (error) {
    console.error("Error updating first login status:", error);
    return false;
  }
};

// Get user details from Firestore
export const getUserDetails = async (userId: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() } as User;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user details:", error);
    return null;
  }
};

// Change password for authenticated user
export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) {
      return { success: false, error: "No authenticated user found" };
    }

    // Re-authenticate user with current password
    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword
    );
    await reauthenticateWithCredential(user, credential);

    // Update password
    await updatePassword(user, newPassword);

    // Mark first login as complete if this is first time
    await markFirstLoginComplete(user.uid);

    return { success: true };
  } catch (error: any) {
    console.error("Error changing password:", error);
    let errorMessage = "Failed to change password";

    if (error.code === "auth/wrong-password") {
      errorMessage = "Current password is incorrect";
    } else if (error.code === "auth/weak-password") {
      errorMessage = "New password is too weak";
    } else if (error.code === "auth/requires-recent-login") {
      errorMessage =
        "Please log out and log in again before changing your password";
    }

    return { success: false, error: errorMessage };
  }
};
