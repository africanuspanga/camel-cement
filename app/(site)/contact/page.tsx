import type { Metadata } from "next";
import { Section, Eyebrow } from "@/components/site/section";
import { ContactForm } from "@/components/forms/contact-form";
import { site } from "@/lib/site";
import {
  MailIcon,
  MailboxIcon,
  MapPinIcon,
  PhoneIcon,
} from "lucide-react";
import { InstagramIcon } from "@/components/site/instagram-icon";

export const metadata: Metadata = {
  title: "Contact Camel Cement Tanzania",
  description:
    "Contact Camel Cement for sales, quotations, product guidance, dealer information, technical support, careers and general enquiries.",
};

const contactCards = [
  {
    icon: PhoneIcon,
    title: "Sales and Quotations",
    lines: [
      { label: site.phone, href: site.phoneHref },
      {
        label: site.salesEmail,
        href: `mailto:${site.salesEmail}`,
      },
    ],
  },
  {
    icon: MailIcon,
    title: "General Enquiries",
    lines: [
      {
        label: site.generalEmail,
        href: `mailto:${site.generalEmail}`,
      },
    ],
  },
  {
    icon: MapPinIcon,
    title: "Factory Location",
    lines: [
      { label: "Mbagala Industrial Area, Kilwa Road" },
      { label: "Dar es Salaam, Tanzania" },
    ],
  },
  {
    icon: MailboxIcon,
    title: "Postal Address",
    lines: [
      { label: "P.O. Box 22786" },
      { label: "Dar es Salaam, Tanzania" },
    ],
  },
  {
    icon: InstagramIcon,
    title: "Follow Us",
    lines: [
      {
        label: site.instagramHandle,
        href: site.instagram,
      },
    ],
  },
];

export default function ContactPage() {
  return (
    <>
      <Section surface="deep" className="py-14 md:py-20">
        <div className="container-site">
          <Eyebrow onDark>CONTACT US</Eyebrow>
          <h1 className="mt-4 max-w-3xl text-h1 text-balance text-white">
            Let Us Build Together
          </h1>
          <p className="mt-5 max-w-2xl text-lead text-white/76">
            Contact Camel Cement for product guidance, quotations, dealer
            information, technical documents, orders and general support.
          </p>
        </div>
      </Section>

      <Section surface="canvas">
        <div className="container-site">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {contactCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="rounded-2xl bg-white p-6 shadow-card"
                >
                  <span className="flex size-11 items-center justify-center rounded-full bg-camel-green-100 text-camel-green-800">
                    <Icon aria-hidden="true" className="size-5" />
                  </span>
                  <h2 className="mt-4 font-bold text-concrete-950">
                    {card.title}
                  </h2>
                  <ul className="mt-2 space-y-1">
                    {card.lines.map((line) => (
                      <li key={line.label} className="text-sm">
                        {"href" in line && line.href ? (
                          <a
                            href={line.href}
                            className="inline-flex min-h-11 items-center font-medium text-camel-green-700 underline-offset-4 hover:underline"
                          >
                            {line.label}
                          </a>
                        ) : (
                          <span className="text-concrete-700">
                            {line.label}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="mx-auto mt-12 max-w-3xl">
            <h2 className="text-h2 text-concrete-950">Send an enquiry</h2>
            <p className="mt-3 text-lead text-concrete-800">
              Complete the form and the right team will respond to your
              enquiry.
            </p>
            <div className="mt-8">
              <ContactForm />
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
