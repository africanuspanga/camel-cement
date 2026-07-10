"use client";

import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
  pdf,
} from "@react-pdf/renderer";
import { site } from "@/lib/site";

// Never hyphenate: product names like "Multi-Purpose" must not break as
// "Multi-Pur-pose".
Font.registerHyphenationCallback((word) => [word]);

/**
 * Branded one-page PDF for calculator estimates.
 *
 * This module is heavy (@react-pdf/renderer), so it must only ever be
 * loaded through a dynamic import from the click handler in
 * result-card.tsx. It is shared by all ten calculator types: the layout
 * is fully data-driven through EstimatePdfData.
 */

export interface EstimatePdfData {
  /** Calculator label, e.g. "Concrete slab". */
  title: string;
  reference: string;
  dateLabel: string;
  /** Project inputs and mix settings as label/value pairs. */
  details: { label: string; value: string }[];
  /** Material quantities as label/value pairs (excludes the bag count). */
  rows: { label: string; value: string }[];
  bags: number;
  productName: string | null;
  productReason: string;
  assumptions: string[];
  disclaimer: string;
  /** Absolute URL of the logo, e.g. `${origin}/logo.png`. */
  logoSrc: string;
}

// Brand tokens mirrored from app/globals.css.
const GREEN_950 = "#003a14";
const GREEN_900 = "#004d1a";
const GREEN_700 = "#00872c";
const GREEN_100 = "#d7f0e0";
const GREEN_50 = "#ecf8f0";
const YELLOW_500 = "#ffac00";
const YELLOW_50 = "#fff8e5";
const INK = "#20231f";
const MUTED = "#5c635a";
const LINE = "#e2e6e0";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9.5,
    color: INK,
    paddingTop: 36,
    paddingHorizontal: 44,
    paddingBottom: 92,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: { height: 64, width: 172, objectFit: "contain" },
  headerRight: { alignItems: "flex-end" },
  eyebrow: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    letterSpacing: 1.6,
    color: GREEN_700,
  },
  headerMeta: { marginTop: 4, fontSize: 8.5, color: MUTED },
  brandBar: { flexDirection: "row", height: 4, marginTop: 14 },
  brandBarGreen: { flex: 4, backgroundColor: GREEN_700 },
  brandBarYellow: { flex: 1, backgroundColor: YELLOW_500 },

  // Title
  title: {
    marginTop: 22,
    fontFamily: "Helvetica-Bold",
    fontSize: 19,
    color: INK,
  },
  subtitle: { marginTop: 3, fontSize: 10, color: MUTED },

  // Hero result band
  hero: {
    marginTop: 16,
    borderRadius: 10,
    backgroundColor: GREEN_900,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroEyebrow: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7.5,
    letterSpacing: 1.4,
    color: YELLOW_500,
  },
  heroBagsRow: { flexDirection: "row", alignItems: "flex-end", marginTop: 6 },
  heroBags: {
    fontFamily: "Helvetica-Bold",
    fontSize: 30,
    color: YELLOW_500,
    lineHeight: 1,
  },
  heroBagsUnit: {
    fontFamily: "Helvetica-Bold",
    fontSize: 13,
    color: YELLOW_500,
    marginLeft: 5,
    marginBottom: 2,
  },
  heroNote: { marginTop: 5, fontSize: 8.5, color: "#cfe4d6" },
  heroProduct: {
    maxWidth: 220,
    borderLeftWidth: 2,
    borderLeftColor: YELLOW_500,
    paddingLeft: 12,
  },
  heroProductLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7,
    letterSpacing: 1.2,
    color: "#cfe4d6",
  },
  heroProductName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    color: "#ffffff",
    marginTop: 4,
  },

  // Two-column body
  columns: { flexDirection: "row", gap: 18, marginTop: 18 },
  column: { flex: 1 },
  panelTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    letterSpacing: 1.4,
    color: GREEN_700,
    marginBottom: 6,
  },
  tableHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: GREEN_50,
    borderRadius: 4,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  tableHeadText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    color: GREEN_950,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    borderBottomWidth: 0.75,
    borderBottomColor: LINE,
    paddingVertical: 5.5,
    paddingHorizontal: 8,
  },
  rowLabel: { fontSize: 9, color: MUTED, flexShrink: 0, paddingRight: 8 },
  rowValue: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9.5,
    color: INK,
    flex: 1,
    textAlign: "right",
  },

  // Recommended product
  productBox: {
    marginTop: 16,
    borderRadius: 8,
    backgroundColor: GREEN_50,
    borderWidth: 1,
    borderColor: GREEN_100,
    padding: 12,
  },
  productName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10.5,
    color: GREEN_950,
    marginTop: 3,
  },
  productReason: { marginTop: 3, fontSize: 8.5, color: MUTED, lineHeight: 1.5 },

  // Assumptions
  assumptions: { marginTop: 14 },
  assumptionRow: { flexDirection: "row", marginTop: 3.5 },
  assumptionDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: GREEN_700,
    marginTop: 3.5,
    marginRight: 6,
  },
  assumptionText: { flex: 1, fontSize: 8, color: MUTED, lineHeight: 1.5 },

  // Disclaimer
  disclaimer: {
    marginTop: 14,
    backgroundColor: YELLOW_50,
    borderLeftWidth: 3,
    borderLeftColor: YELLOW_500,
    borderRadius: 4,
    padding: 10,
  },
  disclaimerText: { fontSize: 8, color: INK, lineHeight: 1.55 },

  // Footer
  footer: {
    position: "absolute",
    left: 44,
    right: 44,
    bottom: 30,
  },
  footerRule: { height: 1, backgroundColor: LINE, marginBottom: 10 },
  footerBrand: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: GREEN_950,
  },
  footerLine: { marginTop: 3, fontSize: 8, color: MUTED },
});

export function EstimateDocument({ data }: { data: EstimatePdfData }) {
  return (
    <Document
      title={`Camel Cement estimate: ${data.title}`}
      author={site.name}
      subject="Preliminary material estimate"
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt prop */}
          <Image style={styles.logo} src={data.logoSrc} />
          <View style={styles.headerRight}>
            <Text style={styles.eyebrow}>MATERIAL ESTIMATE</Text>
            <Text style={styles.headerMeta}>Reference {data.reference}</Text>
            <Text style={styles.headerMeta}>{data.dateLabel}</Text>
          </View>
        </View>
        <View style={styles.brandBar}>
          <View style={styles.brandBarGreen} />
          <View style={styles.brandBarYellow} />
        </View>

        {/* Title */}
        <Text style={styles.title}>{data.title}</Text>
        <Text style={styles.subtitle}>
          Preliminary cement and material estimate prepared with the Camel
          Cement calculator.
        </Text>

        {/* Hero result */}
        <View style={styles.hero}>
          <View>
            <Text style={styles.heroEyebrow}>ESTIMATED REQUIREMENT</Text>
            <View style={styles.heroBagsRow}>
              <Text style={styles.heroBags}>
                {data.bags.toLocaleString("en-US")}
              </Text>
              <Text style={styles.heroBagsUnit}>
                {data.bags === 1 ? "bag" : "bags"}
              </Text>
            </View>
            <Text style={styles.heroNote}>
              50 kg bags of cement, wastage included, rounded up
            </Text>
          </View>
          {data.productName ? (
            <View style={styles.heroProduct}>
              <Text style={styles.heroProductLabel}>RECOMMENDED PRODUCT</Text>
              <Text style={styles.heroProductName}>{data.productName}</Text>
            </View>
          ) : null}
        </View>

        {/* Details + materials */}
        <View style={styles.columns}>
          <View style={styles.column}>
            <Text style={styles.panelTitle}>PROJECT DETAILS</Text>
            <View style={styles.tableHead}>
              <Text style={styles.tableHeadText}>Input</Text>
              <Text style={styles.tableHeadText}>Value</Text>
            </View>
            {data.details.map((detail) => (
              <View key={detail.label} style={styles.row}>
                <Text style={styles.rowLabel}>{detail.label}</Text>
                <Text style={styles.rowValue}>{detail.value}</Text>
              </View>
            ))}
          </View>

          <View style={styles.column}>
            <Text style={styles.panelTitle}>ESTIMATED MATERIALS</Text>
            <View style={styles.tableHead}>
              <Text style={styles.tableHeadText}>Material</Text>
              <Text style={styles.tableHeadText}>Quantity</Text>
            </View>
            {data.rows.map((row) => (
              <View key={row.label} style={styles.row}>
                <Text style={styles.rowLabel}>{row.label}</Text>
                <Text style={styles.rowValue}>{row.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recommended product */}
        {data.productName ? (
          <View style={styles.productBox}>
            <Text style={styles.panelTitle}>WHY THIS PRODUCT</Text>
            <Text style={styles.productName}>{data.productName}</Text>
            <Text style={styles.productReason}>{data.productReason}</Text>
          </View>
        ) : null}

        {/* Assumptions */}
        <View style={styles.assumptions}>
          <Text style={styles.panelTitle}>ASSUMPTIONS</Text>
          {data.assumptions.map((assumption) => (
            <View key={assumption} style={styles.assumptionRow}>
              <View style={styles.assumptionDot} />
              <Text style={styles.assumptionText}>{assumption}</Text>
            </View>
          ))}
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Important: {data.disclaimer}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <View style={styles.footerRule} />
          <Text style={styles.footerBrand}>
            {site.name} · {site.tagline} · {site.brandRelationship}
          </Text>
          <Text style={styles.footerLine}>
            {site.address} · {site.postal}
          </Text>
          <Text style={styles.footerLine}>
            Sales: {site.phone} · {site.salesEmail} · {site.generalEmail}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

/** Renders the estimate to a PDF blob and triggers a browser download. */
export async function downloadEstimatePdf(data: EstimatePdfData) {
  const blob = await pdf(<EstimateDocument data={data} />).toBlob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `camel-cement-estimate-${data.reference.toLowerCase()}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
