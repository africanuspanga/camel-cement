"use client";

import * as React from "react";
import { toast } from "sonner";

import { Switch } from "@/components/ui/switch";
import { toggleResourcePublic } from "@/lib/admin/resource-actions";

export function ResourcePublicSwitch({
  id,
  title,
  initialPublic,
}: {
  id: string;
  title: string;
  initialPublic: boolean;
}) {
  const [checked, setChecked] = React.useState(initialPublic);
  const [pending, startTransition] = React.useTransition();

  const onCheckedChange = (value: boolean) => {
    setChecked(value); // Optimistic — reverted below when the action fails.
    startTransition(async () => {
      const result = await toggleResourcePublic(id, value);
      if (result.ok) {
        toast.success(value ? "Document published" : "Document hidden", {
          description: value
            ? `${title} is visible in the public download centre.`
            : `${title} is now internal only.`,
        });
      } else {
        setChecked(!value);
        toast.error("Could not update visibility", {
          description: result.error,
        });
      }
    });
  };

  return (
    <Switch
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={pending}
      aria-label={`Make ${title} ${checked ? "internal" : "public"}`}
    />
  );
}
