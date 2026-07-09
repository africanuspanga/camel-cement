"use client";

import * as React from "react";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateUserRole } from "@/lib/admin/actions";
import { humaniseStatus } from "@/lib/admin/format";

const ROLES = [
  "super_admin",
  "marketing_admin",
  "sales_manager",
  "sales_officer",
  "technical_officer",
  "hr_admin",
  "customer_support",
  "analyst",
];

export function UserRoleSelect({
  id,
  email,
  role,
  canEdit,
}: {
  id: string;
  email: string;
  role: string;
  /** Only super administrators can change roles (enforced server-side too). */
  canEdit: boolean;
}) {
  const [value, setValue] = React.useState(role);
  const [pending, startTransition] = React.useTransition();

  if (!canEdit) {
    return (
      <span className="text-sm text-muted-foreground">
        {humaniseStatus(role)}
      </span>
    );
  }

  return (
    <Select
      value={value}
      disabled={pending}
      onValueChange={(next) => {
        const previous = value;
        setValue(next);
        startTransition(async () => {
          const result = await updateUserRole(id, next);
          if (result.ok) {
            toast.success(`${email} is now ${humaniseStatus(next)}`);
          } else {
            setValue(previous);
            toast.error("Could not change role", { description: result.error });
          }
        });
      }}
    >
      <SelectTrigger
        aria-label={`Role for ${email}`}
        className="h-8 w-44 rounded-full border-concrete-200 text-xs font-semibold"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ROLES.map((option) => (
          <SelectItem key={option} value={option}>
            {humaniseStatus(option)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
