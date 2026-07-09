/**
 * Seeds 26 SAMPLE dealers in Dar es Salaam for demo purposes.
 * Names, phone numbers and coordinates are illustrative placeholders and
 * should be replaced with the verified dealer directory before launch.
 *
 * Run: npx dotenv -e .env.local -- npx tsx scripts/seed-dealers.ts
 */
import { createClient } from "@supabase/supabase-js";

const districts = [
  "Ilala",
  "Kinondoni",
  "Temeke",
  "Ubungo",
  "Kigamboni",
] as const;

const dealerNames = [
  ["Mbagala Building Supplies", "Temeke", "Kilwa Road, Mbagala"],
  ["Kariakoo Hardware Centre", "Ilala", "Msimbazi Street, Kariakoo"],
  ["Kimara Cement Depot", "Ubungo", "Morogoro Road, Kimara"],
  ["Tegeta Builders Mart", "Kinondoni", "Bagamoyo Road, Tegeta"],
  ["Kigamboni Construction Store", "Kigamboni", "Ferry Road, Kigamboni"],
  ["Buguruni Materials Ltd", "Ilala", "Uhuru Street, Buguruni"],
  ["Mwenge Hardware and Cement", "Kinondoni", "Sam Nujoma Road, Mwenge"],
  ["Tabata Building Centre", "Ilala", "Mandela Road, Tabata"],
  ["Mbezi Beach Suppliers", "Kinondoni", "Old Bagamoyo Road, Mbezi Beach"],
  ["Gongo la Mboto Traders", "Ilala", "Pugu Road, Gongo la Mboto"],
  ["Sinza Cement Stockist", "Ubungo", "Shekilango Road, Sinza"],
  ["Chang'ombe Builders Depot", "Temeke", "Chang'ombe Road"],
  ["Ubungo Maji Hardware", "Ubungo", "Morogoro Road, Ubungo"],
  ["Masaki Construction Supplies", "Kinondoni", "Chole Road, Masaki"],
  ["Vingunguti Materials Store", "Ilala", "Nyerere Road, Vingunguti"],
  ["Mbagala Rangi Tatu Depot", "Temeke", "Kilwa Road, Rangi Tatu"],
  ["Kawe Building Solutions", "Kinondoni", "Old Bagamoyo Road, Kawe"],
  ["Kurasini Port Suppliers", "Temeke", "Nelson Mandela Road, Kurasini"],
  ["Segerea Cement Agency", "Ilala", "Tabata Segerea Road"],
  ["Goba Hardware Mart", "Ubungo", "Goba Road"],
  ["Mikocheni Trade Centre", "Kinondoni", "Mwai Kibaki Road, Mikocheni"],
  ["Temeke Sterio Builders", "Temeke", "Temeke Sterio Street"],
  ["Kibada Construction Store", "Kigamboni", "Kibada Road"],
  ["Manzese Materials Depot", "Ubungo", "Morogoro Road, Manzese"],
  ["Ilala Boma Hardware", "Ilala", "Uhuru Street, Ilala Boma"],
  ["Mbezi Louis Cement Point", "Ubungo", "Morogoro Road, Mbezi Louis"],
] as const;

const productSets = [
  ["32-5n", "32-5r", "42-5n", "42-5r"],
  ["32-5r", "42-5n"],
  ["32-5n", "32-5r"],
  ["32-5r", "42-5n", "42-5r"],
];

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set"
    );
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Remove previous sample rows so the script stays idempotent
  await supabase.from("dealers").delete().like("notes", "%sample dealer%");

  const rows = dealerNames.map(([name, district, address], i) => ({
    name,
    authorised: true,
    contact_person: null,
    phone: `+255 7${(65 + (i % 3)).toString()} ${String(100 + i).padStart(3, "0")} ${String(200 + i * 7).slice(0, 3)}`,
    whatsapp: `+2557${65 + (i % 3)}${String(100 + i)}${String(200 + i * 7).slice(0, 3)}`,
    email: null,
    region: "Dar es Salaam",
    district,
    address: `${address}, Dar es Salaam`,
    latitude: -6.78 - (i % 13) * 0.012,
    longitude: 39.2 + (i % 11) * 0.016,
    opening_hours: i % 4 === 0 ? "Mon-Sat 7:30-18:00" : "Mon-Sat 8:00-17:30, Sun 9:00-13:00",
    products: productSets[i % productSets.length],
    delivery_available: i % 3 !== 2,
    collection_available: true,
    notes: "Demo sample dealer entry - replace with verified directory",
    active: true,
  }));

  const { error, count } = await supabase
    .from("dealers")
    .insert(rows, { count: "exact" });
  if (error) throw error;

  console.log(`✔ Seeded ${count ?? rows.length} sample dealers in Dar es Salaam`);
  console.log(`  Districts covered: ${[...new Set(districts)].join(", ")}`);
}

main().catch((err) => {
  console.error("Dealer seed failed:", err.message ?? err);
  process.exit(1);
});
