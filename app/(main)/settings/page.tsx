"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { User, Lock, Camera, Loader2, Eye, EyeOff, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [tab, setTab] = useState<"profile" | "security">("profile");
  const [profile, setProfile] = useState({ name: "", email: "", phone: "" });
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (session?.user) {
      setProfile({
        name: session.user.name ?? "",
        email: session.user.email ?? "",
        phone: "",
      });
    }
  }, [session]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const res = await fetch("/api/v1/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profile.name }),
      });
      if (res.ok) {
        await update({ name: profile.name });
        toast({ title: "Profile updated" });
      } else {
        const json = await res.json();
        toast({ title: "Error", description: json.error, variant: "destructive" });
      }
    } finally { setProfileSaving(false); }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (passwords.newPassword.length < 8) {
      toast({ title: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }
    setPwSaving(true);
    try {
      const res = await fetch("/api/v1/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        toast({ title: "Password changed successfully" });
        setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        toast({ title: "Error", description: json.error, variant: "destructive" });
      }
    } finally { setPwSaving(false); }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large (max 5MB)", variant: "destructive" });
      return;
    }
    setPhotoUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/v1/users/me", { method: "PATCH", body: form });
      if (res.ok) {
        await update();
        toast({ title: "Photo updated" });
      } else {
        toast({ title: "Upload failed", variant: "destructive" });
      }
    } finally { setPhotoUploading(false); }
  };

  const photoSrc = (session?.user as any)?.profilePhoto ?? null;
  const initials = session?.user.name?.charAt(0).toUpperCase() ?? "?";

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-sm text-gray-500">Manage your account preferences</p>
      </div>

      {/* Tab Nav */}
      <div className="flex gap-1 border-b border-gray-200">
        <button onClick={() => setTab("profile")} className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${tab === "profile" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
          <User className="w-4 h-4 inline-block mr-1.5 -mt-0.5" /> Profile
        </button>
        <button onClick={() => setTab("security")} className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${tab === "security" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
          <Lock className="w-4 h-4 inline-block mr-1.5 -mt-0.5" /> Security
        </button>
      </div>

      {tab === "profile" ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative">
              {photoSrc ? (
                <img src={photoSrc} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-primary/20" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold">
                  {initials}
                </div>
              )}
              <button
                onClick={() => fileRef.current?.click()}
                disabled={photoUploading}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
              >
                {photoUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" /> : <Camera className="w-3.5 h-3.5 text-gray-600" />}
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">{session?.user.name}</p>
              <p className="text-sm text-gray-400">{session?.user.email}</p>
              <p className="text-xs text-primary mt-0.5">{(session?.user.role as string)?.replace(/_/g, " ")}</p>
            </div>
          </div>

          <form onSubmit={saveProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={profile.email} disabled
                className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
              <p className="text-xs text-gray-400 mt-1">Contact admin to update your email address.</p>
            </div>
            <Button type="submit" disabled={profileSaving}>
              {profileSaving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving...</> : "Save Changes"}
            </Button>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Change Password</h2>
          <form onSubmit={changePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <div className="relative">
                <input type={showCurrent ? "text" : "password"} value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <div className="relative">
                <input type={showNew ? "text" : "password"} value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} required minLength={8}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <StrengthIndicator password={passwords.newPassword} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <div className="relative">
                <input type="password" value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                {passwords.confirmPassword && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    {passwords.newPassword === passwords.confirmPassword
                      ? <CheckCircle className="w-4 h-4 text-green-500" />
                      : <span className="text-xs text-red-500">✗</span>}
                  </span>
                )}
              </div>
            </div>
            <Button type="submit" disabled={pwSaving}>
              {pwSaving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Updating...</> : "Update Password"}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}

function StrengthIndicator({ password }: { password: string }) {
  if (!password) return null;
  const checks = [password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)];
  const score = checks.filter(Boolean).length;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "bg-red-400", "bg-yellow-400", "bg-blue-400", "bg-green-500"];
  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < score ? colors[score] : "bg-gray-100"}`} />
        ))}
      </div>
      <p className={`text-xs mt-1 ${score <= 1 ? "text-red-500" : score === 2 ? "text-yellow-600" : score === 3 ? "text-blue-600" : "text-green-600"}`}>
        {labels[score]}
      </p>
    </div>
  );
}
