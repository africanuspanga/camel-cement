"use client";

import * as React from "react";
import { toast } from "sonner";

import { Switch } from "@/components/ui/switch";
import { toggleTestimonialPublished } from "@/lib/admin/testimonial-actions";

/** Optimistic published toggle for a testimonial table row. */
export function TestimonialPublishedSwitch({
  id,
  name,
  published,
}: {
  id: string;
  name: string;
  published: boolean;
}) {
  const [checked, setChecked] = React.useState(published);
  const [pending, startTransition] = React.useTransition();

  return (
    <label className="flex items-center gap-2">
      <Switch
        checked={checked}
        disabled={pending}
        aria-label={`${name}'s testimonial visible on the website`}
        onCheckedChange={(next) => {
          setChecked(next);
          startTransition(async () => {
            const result = await toggleTestimonialPublished(id, next);
            if (result.ok) {
              toast.success(
                next
                  ? `${name}'s testimonial is now live`
                  : `${name}'s testimonial hidden from the site`
              );
            } else {
              setChecked(!next);
              toast.error("Could not update testimonial", {
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
