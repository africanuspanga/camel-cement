"use client";

import * as React from "react";
import { toast } from "sonner";

import { Switch } from "@/components/ui/switch";
import { toggleProductActive } from "@/lib/admin/actions";

export function ProductActiveSwitch({
  id,
  name,
  active,
}: {
  id: string;
  name: string;
  active: boolean;
}) {
  const [checked, setChecked] = React.useState(active);
  const [pending, startTransition] = React.useTransition();

  return (
    <label className="flex items-center gap-2">
      <Switch
        checked={checked}
        disabled={pending}
        aria-label={`${name} visible on the website`}
        onCheckedChange={(next) => {
          setChecked(next);
          startTransition(async () => {
            const result = await toggleProductActive(id, next);
            if (result.ok) {
              toast.success(
                next ? `${name} is now live` : `${name} hidden from the site`
              );
            } else {
              setChecked(!next);
              toast.error("Could not update product", {
                description: result.error,
              });
            }
          });
        }}
        className="data-[state=checked]:bg-camel-green-700"
      />
      <span className="text-xs font-medium text-muted-foreground">
        {checked ? "Live" : "Hidden"}
      </span>
    </label>
  );
}
