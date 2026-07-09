"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { upsertSiteSetting } from "@/lib/admin/actions";

export interface SettingDefinition {
  key: string;
  label: string;
  description: string;
  value: string;
}

function SettingRow({ setting }: { setting: SettingDefinition }) {
  const [value, setValue] = React.useState(setting.value);
  const [savedValue, setSavedValue] = React.useState(setting.value);
  const [pending, startTransition] = React.useTransition();

  const dirty = value !== savedValue;

  const save = () => {
    startTransition(async () => {
      const result = await upsertSiteSetting(setting.key, value);
      if (result.ok) {
        setSavedValue(value);
        toast.success(`${setting.label} saved`);
      } else {
        toast.error(`Could not save ${setting.label.toLowerCase()}`, {
          description: result.error,
        });
      }
    });
  };

  return (
    <div className="flex flex-col gap-2 border-b border-concrete-200 py-4 first:pt-0 last:border-0 last:pb-0">
      <div>
        <Label htmlFor={`setting-${setting.key}`} className="text-sm font-semibold">
          {setting.label}
        </Label>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {setting.description}
        </p>
      </div>
      <div className="flex gap-2">
        <Input
          id={`setting-${setting.key}`}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="h-10 flex-1"
        />
        <Button
          onClick={save}
          disabled={!dirty || pending}
          className="h-10 rounded-full bg-camel-green-700 px-4 hover:bg-camel-green-800"
        >
          {pending ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}

export function SettingsEditor({ settings }: { settings: SettingDefinition[] }) {
  return (
    <div>
      {settings.map((setting) => (
        <SettingRow key={setting.key} setting={setting} />
      ))}
    </div>
  );
}
