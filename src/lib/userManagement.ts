import {
  createUserWithEmailAndPassword,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  signInWithEmailAndPassword,
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
  where,
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

// Create a new user account with temporary password
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

    // Generate a unique ID for the user (since we're not creating in Firebase Auth yet)
    const userId = `user_${Date.now()}_${Math.random()
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
      needsFirebaseAccount: true, // Flag to indicate Firebase account creation needed
    };

    // Store user details in Firestore
    console.log("Storing user in Firestore:", user);
    await setDoc(doc(db, "users", user.id), user);
    console.log("User stored successfully with ID:", user.id);

    // Verify the user was stored by immediately reading it back
    const verifyDoc = await getDoc(doc(db, "users", user.id));
    if (verifyDoc.exists()) {
      console.log("Verification: User exists in Firestore:", verifyDoc.data());
    } else {
      console.error(
        "Verification: User NOT found in Firestore after creation!"
      );
    }

    return { success: true, user, tempPassword };
  } catch (error: any) {
    console.error("Error creating user account:", error);
    return {
      success: false,
      error: error.message || "Failed to create user account",
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

    console.log("getAllUsers - Found", users.length, "users:", users);
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

    // Check if this is a first-time user
    const userDetails = await getUserDetails(user.uid);
    const isFirstLogin = userDetails?.isFirstLogin || false;

    // For first-time users, skip re-authentication since they just logged in
    if (!isFirstLogin) {
      // Re-authenticate user with current password for existing users
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);
    }

    // Update password
    await updatePassword(user, newPassword);

    // Mark first login as complete
    await markFirstLoginComplete(user.uid);

    return { success: true };
  } catch (error: any) {
    console.error("Error changing password:", error);
    let errorMessage = "Failed to change password";

    switch (error.code) {
      case "auth/wrong-password":
        errorMessage = "Current password is incorrect";
        break;
      case "auth/weak-password":
        errorMessage =
          "New password is too weak (minimum 6 characters required)";
        break;
      case "auth/requires-recent-login":
        errorMessage =
          "Please log out and log in again before changing your password";
        break;
      case "auth/too-many-requests":
        errorMessage = "Too many requests. Please wait a moment and try again";
        break;
      default:
        errorMessage = error.message || "Failed to change password";
    }

    return { success: false, error: errorMessage };
  }
};

// Create Firebase account when user logs in with temp password
export const createFirebaseAccountOnLogin = async (
  email: string,
  tempPassword: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Check if user exists in Firestore with temp password
    console.log("Looking for user with email:", email);
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const snapshot = await getDocs(q);

    console.log(
      "Query result - empty:",
      snapshot.empty,
      "size:",
      snapshot.size
    );

    if (snapshot.empty) {
      return { success: false, error: "No user found with this email" };
    }

    const userDocSnap = snapshot.docs[0];
    const userDoc = { id: userDocSnap.id, ...userDocSnap.data() } as User;

    // Check if the provided password matches the temp password
    if (userDoc.tempPassword !== tempPassword) {
      return { success: false, error: "Invalid password" };
    }

    // Check if user is active
    if (!userDoc.isActive) {
      return { success: false, error: "User account is deactivated" };
    }

    // Create Firebase account
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      tempPassword
    );

    // Create the user document with the Firebase UID as the document ID
    const newUserDoc: User = {
      ...userDoc,
      id: userCredential.user.uid,
      needsFirebaseAccount: false,
      lastLoginAt: Date.now(),
    };

    await setDoc(doc(db, "users", userCredential.user.uid), newUserDoc);

    // Delete the old document with the temporary ID
    if (userDoc.id !== userCredential.user.uid) {
      await deleteDoc(doc(db, "users", userDoc.id));
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error creating Firebase account on login:", error);
    return {
      success: false,
      error: error.message || "Failed to create account",
    };
  }
};
