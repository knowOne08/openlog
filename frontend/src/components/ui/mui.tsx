"use client";

import * as React from "react";
import NextLink from "next/link";
import {
  Avatar as MuiAvatar,
  Box,
  Button as MuiButton,
  Chip as MuiChip,
  CircularProgress,
  Dialog,
  DialogContent,
  Link as MuiLink,
  MenuItem,
  Paper,
  Switch as MuiSwitch,
  TextField,
  Typography,
} from "@mui/material";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "tertiary";

interface ButtonProps {
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  onPress?: () => void;
  disabled?: boolean;
  isDisabled?: boolean;
  children: React.ReactNode;
  variant?: ButtonVariant;
  className?: string;
  size?: "sm" | "md" | "lg";
  color?: "default" | "primary" | "danger";
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  isIconOnly?: boolean;
  isLoading?: boolean;
  href?: string;
}

export function Button({
  type = "button",
  onClick,
  onPress,
  disabled = false,
  isDisabled = false,
  children,
  variant = "primary",
  className = "",
  size = "md",
  color = "default",
  startContent,
  endContent,
  isIconOnly = false,
  isLoading = false,
  href,
}: ButtonProps) {
  const resolvedVariant =
    variant === "outline"
      ? "outlined"
      : variant === "ghost"
        ? "text"
        : "contained";

  const resolvedColor =
    variant === "danger" || color === "danger"
      ? "error"
      : variant === "secondary"
        ? "secondary"
        : "primary";

  const padding = isIconOnly
    ? 1
    : size === "lg"
      ? "12px 24px"
      : size === "sm"
        ? "8px 16px"
        : "10px 20px";

  const button = (
    <MuiButton
      type={type}
      onClick={onPress ?? onClick}
      disabled={disabled || isDisabled || isLoading}
      variant={resolvedVariant}
      color={resolvedColor}
      startIcon={startContent}
      endIcon={endContent}
      sx={{
        px: isIconOnly ? 0 : undefined,
        py: isIconOnly ? 0 : undefined,
        minWidth: isIconOnly ? 40 : undefined,
        width: isIconOnly ? 40 : undefined,
        height: isIconOnly ? 40 : undefined,
        borderRadius: 3,
        textTransform: "none",
        fontWeight: 600,
        boxShadow:
          variant === "primary" ||
          variant === "secondary" ||
          variant === "danger"
            ? 0
            : undefined,
        padding,
        ...(variant === "tertiary"
          ? {
              bgcolor: "background.paper",
              color: "text.primary",
              border: "1px solid",
              borderColor: "divider",
              "&:hover": {
                bgcolor: "action.hover",
              },
            }
          : {}),
      }}
      className={className}
    >
      {isLoading ? "Loading..." : children}
    </MuiButton>
  );

  if (href) {
    return (
      <MuiLink
        component={NextLink}
        href={href}
        underline="none"
        sx={{ display: "inline-flex" }}
      >
        {button}
      </MuiLink>
    );
  }

  return button;
}

export function Card({
  children,
  className = "",
  ...props
}: React.ComponentProps<typeof Paper>) {
  return (
    <Paper
      {...props}
      className={className}
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        overflow: "hidden",
        ...props.sx,
      }}
    >
      {children}
    </Paper>
  );
}

export function CardBody({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <Box className={className}>{children}</Box>;
}

export function CardHeader({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <Box className={className}>{children}</Box>;
}

interface InputProps {
  id?: string;
  type?: string;
  value?: string;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  onKeyDown?: React.KeyboardEventHandler<
    HTMLInputElement | HTMLTextAreaElement | HTMLDivElement
  >;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  className?: string;
  classNames?: Record<string, string>;
  suppressHydrationWarning?: boolean;
  isRequired?: boolean;
  label?: string;
  variant?: "flat" | "bordered" | "underlined";
  multiline?: boolean;
  rows?: number;
}

export function Input({
  onValueChange,
  onChange,
  onKeyDown,
  className = "",
  variant,
  multiline,
  rows,
  ...props
}: InputProps) {
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    onChange?.(event);
    onValueChange?.(event.target.value);
  };

  return (
    <TextField
      {...props}
      onChange={handleChange}
      onKeyDown={
        onKeyDown as React.KeyboardEventHandler<HTMLDivElement> | undefined
      }
      fullWidth
      multiline={multiline}
      rows={rows}
      variant={variant === "underlined" ? "standard" : "outlined"}
      className={className}
      sx={{
        "& .MuiInputBase-root": {
          borderRadius: 3,
        },
      }}
    />
  );
}

export function TextArea(props: InputProps) {
  return <Input {...props} multiline rows={4} />;
}

export function Label({
  children,
  className = "",
  htmlFor,
}: {
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
}) {
  return (
    <Typography
      component="label"
      htmlFor={htmlFor}
      className={className}
      variant="body2"
      sx={{ fontWeight: 600, color: "text.primary" }}
    >
      {children}
    </Typography>
  );
}

export function Spinner({
  size = "md",
  color = "current",
}: {
  size?: "sm" | "md" | "lg";
  color?: string;
}) {
  const resolvedSize = size === "lg" ? 44 : size === "sm" ? 20 : 32;
  return (
    <CircularProgress
      size={resolvedSize}
      sx={{ color: color === "current" ? "inherit" : undefined }}
    />
  );
}

export function Link({
  href,
  children,
  className = "",
  underline = "always",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  underline?: "always" | "hover" | "none";
}) {
  const isExternal = /^https?:\/\//i.test(href);

  if (isExternal) {
    return (
      <MuiLink
        href={href}
        className={className}
        underline={underline}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </MuiLink>
    );
  }

  return (
    <MuiLink
      component={NextLink}
      href={href}
      className={className}
      underline={underline}
    >
      {children}
    </MuiLink>
  );
}

type ChipProps = Omit<
  React.ComponentProps<typeof MuiChip>,
  "children" | "label"
> & {
  children?: React.ReactNode;
  label?: React.ReactNode;
};

export function Chip({ children, label, ...props }: ChipProps) {
  return <MuiChip {...props} label={label ?? children} />;
}

type AvatarProps = React.ComponentProps<typeof MuiAvatar> & {
  size?: "sm" | "md" | "lg" | "xl";
};

export function Avatar({ size = "md", sx, ...props }: AvatarProps) {
  const dimension =
    size === "xl" ? 72 : size === "lg" ? 56 : size === "sm" ? 32 : 40;
  return (
    <MuiAvatar {...props} sx={{ width: dimension, height: dimension, ...sx }} />
  );
}

type SwitchContextValue = {
  checked: boolean;
  onChange?: (checked: boolean) => void;
};

const SwitchContext = React.createContext<SwitchContextValue | null>(null);

function Switch({
  isSelected = false,
  onChange,
  children,
  className = "",
}: {
  isSelected?: boolean;
  onChange?: (checked: boolean) => void;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <SwitchContext.Provider value={{ checked: isSelected, onChange }}>
      <Box
        className={className}
        sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}
      >
        {children}
      </Box>
    </SwitchContext.Provider>
  );
}

Switch.Control = function Control({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  const context = React.useContext(SwitchContext);
  return (
    <Box
      className={className}
      sx={{ display: "inline-flex", alignItems: "center" }}
    >
      <MuiSwitch
        checked={context?.checked ?? false}
        onChange={(_, checked) => context?.onChange?.(checked)}
      />
      {children}
    </Box>
  );
};

Switch.Thumb = function Thumb({ className = "" }: { className?: string }) {
  return <Box className={className} />;
};

export { Switch };

type ModalProps = {
  isOpen: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
};

function Modal({ isOpen, onOpenChange, children }: ModalProps) {
  return (
    <Dialog
      open={isOpen}
      onClose={() => onOpenChange?.(false)}
      fullWidth
      maxWidth="md"
    >
      <DialogContent>{children}</DialogContent>
    </Dialog>
  );
}

Modal.Backdrop = function Backdrop({
  children,
}: {
  children: React.ReactNode;
  [key: string]: unknown;
}) {
  return <>{children}</>;
};

Modal.Container = function Container({
  children,
}: {
  children: React.ReactNode;
  [key: string]: unknown;
}) {
  return <>{children}</>;
};

Modal.Dialog = function DialogSlot({
  children,
}: {
  children: React.ReactNode;
  [key: string]: unknown;
}) {
  return <Box>{children}</Box>;
};

export { Modal };

type SelectProps = React.ComponentProps<typeof TextField> & {
  selectedKey?: string;
};

function Select({
  children,
  selectedKey,
  value,
  onChange,
  ...props
}: SelectProps & { children?: React.ReactNode }) {
  return (
    <TextField
      {...props}
      select
      fullWidth
      value={value ?? selectedKey ?? ""}
      onChange={onChange}
      variant="outlined"
      sx={{ "& .MuiInputBase-root": { borderRadius: 3 } }}
    >
      {children}
    </TextField>
  );
}

Select.Trigger = function Trigger() {
  return null;
};

Select.Popover = function Popover({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
};

function ListBox({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function ListBoxItem({
  children,
  ...props
}: React.ComponentProps<typeof MenuItem> & { textValue?: string }) {
  return <MenuItem {...props}>{children}</MenuItem>;
}

export { Select, ListBox, ListBoxItem };
