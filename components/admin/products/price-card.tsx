"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { BanknoteIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updateBagPrice } from "@/lib/admin/pricing-actions";
import { formatTzs } from "@/lib/cart/pricing";

export function PriceCard({ currentPrice }: { currentPrice: number }) {
  const [value, setValue] = useState(String(currentPrice));
  const [pending, startTransition] = useTransition();

  const parsed = Number(value);
  const changed = Number.isFinite(parsed) && parsed !== currentPrice;

  const save = () => {
    startTransition(async () => {
      const result = await updateBagPrice(Math.round(parsed));
      if (result.ok) {
        toast.success("Price updated", {
          description: `All products now show ${formatTzs(Math.round(parsed))} per 50 kg bag.`,
        });
      } else {
        toast.error("Could not update price", { description: result.error });
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BanknoteIcon
            className="size-5 text-camel-green-700"
            aria-hidden="true"
          />
          Bag price
        </CardTitle>
        <CardDescription>
          The retail price per 50 kg bag shown on product cards, product pages
          and the cart. Currently{" "}
          <span className="font-bold tabular-nums text-foreground">
            {formatTzs(currentPrice)}
          </span>
          .
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (changed && !pending) save();
          }}
          className="flex flex-wrap items-end gap-3"
        >
          <div className="space-y-1.5">
            <Label htmlFor="bag-price">Price per bag (TZS)</Label>
            <Input
              id="bag-price"
              type="number"
              inputMode="numeric"
              min={500}
              max={1000000}
              step={100}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="h-11 w-44 tabular-nums"
            />
          </div>
          <Button
            type="submit"
            disabled={!changed || pending}
            className="h-11 rounded-full bg-camel-green-700 px-6 font-bold text-white hover:bg-camel-green-800"
          >
            {pending ? "Saving..." : "Save price"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
