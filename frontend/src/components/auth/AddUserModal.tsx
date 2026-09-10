"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Alert,
} from "@mui/material";

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
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add New User</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ color: "text.secondary", fontSize: 14 }}>
            Create a new organization member from the admin dashboard.
          </Box>
          {error && <Alert severity="error">{error}</Alert>}
          {success && (
            <Alert severity="success">User added successfully!</Alert>
          )}
          <TextField
            id="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
            type="email"
            label="Email"
            placeholder="user@example.com"
            fullWidth
          />
          <TextField
            id="name"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setName(e.target.value)
            }
            label="Name"
            placeholder="Full Name"
            fullWidth
          />
          <TextField
            id="role"
            select
            label="Role"
            value={role}
            onChange={(e) => setRole(e.target.value as "admin" | "member")}
            fullWidth
          >
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="member">Member</MenuItem>
          </TextField>
          <TextField
            id="team"
            value={team}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setTeam(e.target.value)
            }
            label="Team"
            placeholder="Team name (optional)"
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleAddUser} disabled={loading} variant="contained">
          {loading ? "Adding..." : "Add User"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
