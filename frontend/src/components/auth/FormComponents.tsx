"use client";

import { ReactNode, useState } from "react";
import {
  Box,
  Button as MuiButton,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { Lock, Visibility, VisibilityOff } from "@mui/icons-material";

interface InputFieldProps {
  id: string;
  name: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  autoComplete?: string;
  className?: string;
}

export function InputField({
  id,
  name,
  type,
  placeholder,
  value,
  onChange,
  required = false,
  autoComplete,
  className = "",
}: InputFieldProps) {
  return (
    <TextField
      id={id}
      name={name}
      type={type}
      autoComplete={autoComplete}
      required={required}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      size="small"
      fullWidth
      className={className}
    />
  );
}

interface PasswordFieldProps {
  id: string;
  name: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  autoComplete?: string;
}

export function PasswordField({
  id,
  name,
  placeholder,
  value,
  onChange,
  required = false,
  autoComplete,
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <TextField
      id={id}
      name={name}
      type={showPassword ? "text" : "password"}
      autoComplete={autoComplete}
      required={required}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      size="small"
      fullWidth
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
              >
                {showPassword ? (
                  <VisibilityOff fontSize="small" />
                ) : (
                  <Visibility fontSize="small" />
                )}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}

interface ButtonProps {
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  disabled?: boolean;
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline";
  className?: string;
}

export function Button({
  type = "button",
  onClick,
  disabled = false,
  children,
  variant = "primary",
  className = "",
}: ButtonProps) {
  return (
    <MuiButton
      type={type}
      onClick={onClick}
      disabled={disabled}
      variant={variant === "outline" ? "outlined" : "contained"}
      color={variant === "secondary" ? "secondary" : "primary"}
      className={className}
      fullWidth
    >
      {children}
    </MuiButton>
  );
}

interface SocialButtonProps {
  provider: "google" | "microsoft";
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}

export function SocialButton({
  provider,
  onClick,
  disabled = false,
  children,
}: SocialButtonProps) {
  const providerIcon =
    provider === "google" ? (
      <Box
        sx={{
          width: 20,
          height: 20,
          bgcolor: "#ea4335",
          borderRadius: 999,
          display: "grid",
          placeItems: "center",
          color: "white",
          fontSize: 11,
          fontWeight: 700,
          mr: 1.5,
        }}
      >
        G
      </Box>
    ) : (
      <Box
        sx={{
          width: 20,
          height: 20,
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 0.5,
          mr: 1.5,
        }}
      >
        <Box sx={{ width: 8, height: 8, bgcolor: "#f25022" }} />
        <Box sx={{ width: 8, height: 8, bgcolor: "#7fba00" }} />
        <Box sx={{ width: 8, height: 8, bgcolor: "#00a4ef" }} />
        <Box sx={{ width: 8, height: 8, bgcolor: "#ffb900" }} />
      </Box>
    );

  return (
    <MuiButton
      onClick={onClick}
      disabled={disabled}
      variant="outlined"
      fullWidth
      sx={{
        justifyContent: "center",
        py: 1.5,
        color: "text.primary",
        borderColor: "divider",
      }}
    >
      {providerIcon}
      {children}
    </MuiButton>
  );
}

interface SeparatorProps {
  text?: string;
}

export function Separator({ text = "or" }: SeparatorProps) {
  return (
    <Box sx={{ position: "relative" }}>
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
        }}
      >
        <Box sx={{ width: "100%", borderTop: 1, borderColor: "divider" }} />
      </Box>
      <Box
        sx={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          fontSize: 14,
        }}
      >
        <Box
          sx={{ px: 1.5, bgcolor: "background.paper", color: "text.secondary" }}
        >
          {text}
        </Box>
      </Box>
    </Box>
  );
}

interface ComplianceInfoProps {
  className?: string;
}

export function ComplianceInfo({ className = "" }: ComplianceInfoProps) {
  return (
    <Typography
      variant="caption"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "text.secondary",
      }}
      className={className}
    >
      <Lock sx={{ fontSize: 16, mr: 0.5 }} />
      GDPR compliant. ISO-27001 certified.
    </Typography>
  );
}
