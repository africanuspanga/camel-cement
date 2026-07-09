import type { Metadata } from "next";
import { Section, Eyebrow } from "@/components/site/section";
import { OrderForm } from "@/components/forms/order-form";

export const metadata: Metadata = {
  title: "Order Camel Cement | Prepare Your Cement Order",
  description:
    "Select Camel Cement products and quantities, provide the delivery or collection details and submit the order for price and availability confirmation.",
};

export default function OrderPage() {
  return (
    <>
      <Section surface="deep" className="py-14 md:py-20">
        <div className="container-site">
          <Eyebrow onDark>ORDER CEMENT</Eyebrow>
          <h1 className="mt-4 max-w-3xl text-h1 text-balance text-white">
            Prepare Your Cement Order
          </h1>
          <p className="mt-5 max-w-2xl text-lead text-white/76">
            Select products and quantities, provide the delivery or collection
            details and submit the order for price and availability
            confirmation.
          </p>
        </div>
      </Section>

      <Section surface="canvas">
        <div className="container-site">
          <OrderForm />
        </div>
      </Section>
    </>
  );
}
