"use client";

import { useState } from "react";
import {
  Button,
  Input,
  Label,
  ListBoxItem,
  Modal,
  Select,
} from "@heroui/react";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded?: () => void;
}

export default function AddUserModal({
  isOpen,
  onClose,
  onUserAdded,
}: AddUserModalProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");
  const [team, setTeam] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleAddUser = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const token = localStorage.getItem("surfe_access_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/admin/create-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ email, name, role, team }),
        },
      );
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setEmail("");
        setName("");
        setRole("member");
        setTeam("");
        if (onUserAdded) onUserAdded();
      } else {
        setError(data.error || "Failed to add user");
      }
    } catch (err) {
      setError((err as Error)?.message || "Failed to add user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={!isOpen ? onClose : undefined}>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-1">
          <span className="text-lg font-semibold text-foreground">
            Add New User
          </span>
          <span className="text-sm text-foreground-500">
            Create a new organization member from the admin dashboard.
          </span>
        </div>
        <div className="flex flex-col gap-4">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900 dark:text-red-200">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 dark:border-green-800 dark:bg-green-900 dark:text-green-200">
              User added successfully!
            </div>
          )}
          <div className="flex flex-col gap-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              type="email"
              placeholder="user@example.com"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setName(e.target.value)
              }
              placeholder="Full Name"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="role">Role</Label>
            <Select
              id="role"
              selectedKey={role}
              onChange={(e) => {
                if (e && e !== null) {
                  setRole((e as unknown as "admin" | "member") || "member");
                }
              }}
            >
              <ListBoxItem key="admin" id="admin" textValue="Admin">
                Admin
              </ListBoxItem>
              <ListBoxItem key="member" id="member" textValue="Member">
                Member
              </ListBoxItem>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="team">Team</Label>
            <Input
              id="team"
              value={team}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setTeam(e.target.value)
              }
              placeholder="Team name (optional)"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button onPress={onClose} variant="outline">
            Cancel
          </Button>
          <Button
            onPress={handleAddUser}
            isDisabled={loading}
            className="bg-foreground text-background"
          >
            {loading ? "Adding..." : "Add User"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
