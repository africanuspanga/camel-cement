import type { Metadata } from "next";
import { Section, Eyebrow } from "@/components/site/section";
import { CartView } from "@/components/cart/cart-view";
import { getCementPriceTzs } from "@/lib/cart/get-cement-price";
import { formatTzs } from "@/lib/cart/pricing";

export const metadata: Metadata = {
  title: "Your Cart | Camel Cement",
  description:
    "Review your Camel Cement order — bag quantities, estimated weight and subtotal — then submit it as an order request to our sales team.",
};

export default async function CartPage() {
  const pricePerBag = await getCementPriceTzs();

  return (
    <>
      {/* Hero */}
      <Section surface="canvas" className="py-10 md:py-14 lg:py-16">
        <div className="container-site space-y-4">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="h-1 w-8 rounded-full bg-camel-yellow-500"
            />
            <Eyebrow>Your Cart</Eyebrow>
          </div>
          <h1 className="text-h1 text-balance text-concrete-950">
            Your Cement Order
          </h1>
          <p className="max-w-2xl text-lead text-concrete-800">
            Every Camel Cement grade is supplied in 50 kg bags at{" "}
            <span className="font-bold tabular-nums text-concrete-950">
              {formatTzs(pricePerBag)}
            </span>{" "}
            per bag. Adjust your quantities below, then send us your order.
          </p>
        </div>
      </Section>

      <CartView pricePerBag={pricePerBag} />
    </>
  );
}
