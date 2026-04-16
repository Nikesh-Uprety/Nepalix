import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  User,
  Lock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { GlassCard } from "@/components/ui-custom/GlassCard";
import { Link } from "wouter";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ProfileValues = z.infer<typeof profileSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

const inputClass = (error: boolean) =>
  `w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-gray-500 text-sm focus:outline-none transition-colors ${
    error
      ? "border-red-500/50 focus:border-red-500"
      : "border-white/10 focus:border-[#06B6D4]/60"
  }`;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
      <AlertCircle className="w-3 h-3 flex-shrink-0" />
      {message}
    </p>
  );
}

export default function AccountSettings() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
    },
  });

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  useEffect(() => {
    if (user) {
      profileForm.reset({
        firstName: user.firstName,
        lastName: user.lastName,
      });
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070B14] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#06B6D4]/30 border-t-[#06B6D4] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  async function handleProfileUpdate(data: ProfileValues) {
    setProfileSuccess(false);
    setProfileError("");
    try {
      await api.account.updateProfile(data);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (e: unknown) {
      setProfileError(e instanceof Error ? e.message : "Update failed");
    }
  }

  async function handlePasswordChange(data: PasswordValues) {
    setPasswordSuccess(false);
    setPasswordError("");
    try {
      await api.account.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setPasswordSuccess(true);
      passwordForm.reset();
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (e: unknown) {
      setPasswordError(e instanceof Error ? e.message : "Password change failed");
    }
  }

  return (
    <div className="pt-24 min-h-[100dvh] bg-[#070B14]">
      <div className="max-w-2xl mx-auto px-4 pb-16">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-bold text-white font-heading mb-2">
            Account Settings
          </h1>
          <p className="text-gray-400 mb-8">
            Manage your profile and security settings.
          </p>

          {/* Profile section */}
          <GlassCard className="mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#06B6D4]/15 flex items-center justify-center">
                <User className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Profile Information
                </h2>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
            </div>

            {profileSuccess && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                Profile updated successfully!
              </div>
            )}
            {profileError && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {profileError}
              </div>
            )}

            <form
              onSubmit={profileForm.handleSubmit(handleProfileUpdate)}
              className="space-y-4"
              noValidate
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">
                    First Name
                  </label>
                  <input
                    {...profileForm.register("firstName")}
                    className={inputClass(
                      !!profileForm.formState.errors.firstName
                    )}
                  />
                  <FieldError
                    message={profileForm.formState.errors.firstName?.message}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">
                    Last Name
                  </label>
                  <input
                    {...profileForm.register("lastName")}
                    className={inputClass(
                      !!profileForm.formState.errors.lastName
                    )}
                  />
                  <FieldError
                    message={profileForm.formState.errors.lastName?.message}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">
                  Email
                </label>
                <input
                  value={user?.email ?? ""}
                  disabled
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5 text-gray-500 text-sm cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-600">
                  Email cannot be changed.
                </p>
              </div>
              <button
                type="submit"
                disabled={profileForm.formState.isSubmitting}
                className="px-6 py-2.5 rounded-xl text-white font-medium text-sm transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #06B6D4, #3B82F6)",
                }}
              >
                {profileForm.formState.isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </form>
          </GlassCard>

          {/* Password section */}
          <GlassCard>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center">
                <Lock className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Change Password
                </h2>
                <p className="text-xs text-gray-400">
                  You'll be kept signed in on this device.
                </p>
              </div>
            </div>

            {passwordSuccess && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                Password changed! All other sessions have been signed out.
              </div>
            )}
            {passwordError && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {passwordError}
              </div>
            )}

            <form
              onSubmit={passwordForm.handleSubmit(handlePasswordChange)}
              className="space-y-4"
              noValidate
            >
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    {...passwordForm.register("currentPassword")}
                    type={showCurrent ? "text" : "password"}
                    className={inputClass(
                      !!passwordForm.formState.errors.currentPassword
                    )}
                    placeholder="Your current password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showCurrent ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <FieldError
                  message={
                    passwordForm.formState.errors.currentPassword?.message
                  }
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    {...passwordForm.register("newPassword")}
                    type={showNew ? "text" : "password"}
                    className={inputClass(
                      !!passwordForm.formState.errors.newPassword
                    )}
                    placeholder="Min 8 characters"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showNew ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <FieldError
                  message={passwordForm.formState.errors.newPassword?.message}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  {...passwordForm.register("confirmPassword")}
                  type="password"
                  className={inputClass(
                    !!passwordForm.formState.errors.confirmPassword
                  )}
                  placeholder="Re-enter your new password"
                  autoComplete="new-password"
                />
                <FieldError
                  message={
                    passwordForm.formState.errors.confirmPassword?.message
                  }
                />
              </div>
              <button
                type="submit"
                disabled={passwordForm.formState.isSubmitting}
                className="px-6 py-2.5 rounded-xl text-white font-medium text-sm transition-all hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 bg-purple-600/80 hover:bg-purple-600 border border-purple-500/30"
              >
                {passwordForm.formState.isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Changing...
                  </>
                ) : (
                  "Change Password"
                )}
              </button>
            </form>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
