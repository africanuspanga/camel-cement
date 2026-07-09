import type { Metadata } from "next";
import { BriefcaseBusiness, GraduationCap, UserRound } from "lucide-react";

import {
  ApplicationStatusSelect,
  NewVacancyDialog,
  VacancyPublishSwitch,
} from "@/components/admin/careers-controls";
import { EmptyState } from "@/components/admin/empty-state";
import { PageHeader } from "@/components/admin/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate, relativeTime } from "@/lib/admin/format";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Careers",
};

interface VacancyRow {
  id: string;
  title: string;
  department: string;
  location: string;
  employment_type: string;
  closes_at: string | null;
  published: boolean;
}

interface ApplicationRow {
  id: string;
  reference: string;
  full_name: string;
  position: string | null;
  status: string;
  created_at: string;
}

interface TalentRow {
  id: string;
  full_name: string;
  email: string;
  areas_of_interest: string | null;
  created_at: string;
}

export default async function CareersPage() {
  const supabase = await createClient();

  let vacancies: VacancyRow[] = [];
  let applications: ApplicationRow[] = [];
  let talent: TalentRow[] = [];

  if (supabase) {
    const [vacanciesRes, applicationsRes, talentRes] = await Promise.all([
      supabase
        .from("vacancies")
        .select("id, title, department, location, employment_type, closes_at, published")
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("job_applications")
        .select("id, reference, full_name, position, status, created_at")
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("talent_profiles")
        .select("id, full_name, email, areas_of_interest, created_at")
        .order("created_at", { ascending: false })
        .limit(50),
    ]);
    vacancies = (vacanciesRes.data ?? []) as VacancyRow[];
    applications = (applicationsRes.data ?? []) as ApplicationRow[];
    talent = (talentRes.data ?? []) as TalentRow[];
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Careers"
        description="Vacancies on the public careers page, incoming applications and the talent community."
      >
        <NewVacancyDialog />
      </PageHeader>

      <Tabs defaultValue="vacancies">
        <TabsList className="h-10 rounded-full bg-white p-1 ring-1 ring-concrete-200">
          <TabsTrigger value="vacancies" className="rounded-full px-4">
            Vacancies
          </TabsTrigger>
          <TabsTrigger value="applications" className="rounded-full px-4">
            Applications
          </TabsTrigger>
        </TabsList>

        {/* ── Vacancies ── */}
        <TabsContent value="vacancies" className="mt-4">
          <Card className="gap-0 overflow-hidden rounded-2xl border-concrete-200 bg-white py-0 shadow-none">
            {vacancies.length === 0 ? (
              <EmptyState
                icon={BriefcaseBusiness}
                title="No vacancies yet"
                body="Create your first vacancy — it stays in draft until you publish it to the careers page."
              />
            ) : (
              <Table>
                <TableHeader className="bg-concrete-50">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-5">Title</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Department
                    </TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Location
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">Type</TableHead>
                    <TableHead className="hidden sm:table-cell">Closes</TableHead>
                    <TableHead className="pr-5">Published</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vacancies.map((row) => (
                    <TableRow key={row.id} className="h-12">
                      <TableCell className="pl-5 font-medium">
                        {row.title}
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground md:table-cell">
                        {row.department}
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground sm:table-cell">
                        {row.location}
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground lg:table-cell">
                        {row.employment_type}
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground tabular-nums sm:table-cell">
                        {formatDate(row.closes_at)}
                      </TableCell>
                      <TableCell className="pr-5">
                        <VacancyPublishSwitch
                          id={row.id}
                          title={row.title}
                          published={row.published}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>

        {/* ── Applications ── */}
        <TabsContent value="applications" className="mt-4 space-y-4">
          <Card className="gap-0 overflow-hidden rounded-2xl border-concrete-200 bg-white py-0 shadow-none">
            {applications.length === 0 ? (
              <EmptyState
                icon={UserRound}
                title="No applications yet"
                body="Applications submitted on the careers page will appear here for screening."
              />
            ) : (
              <Table>
                <TableHeader className="bg-concrete-50">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-5">Reference</TableHead>
                    <TableHead>Candidate</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Position
                    </TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Received
                    </TableHead>
                    <TableHead className="pr-5">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((row) => (
                    <TableRow key={row.id} className="h-12">
                      <TableCell className="pl-5 font-mono text-[13px] font-semibold">
                        {row.reference}
                      </TableCell>
                      <TableCell className="font-medium">
                        {row.full_name}
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground md:table-cell">
                        {row.position ?? "—"}
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground tabular-nums sm:table-cell">
                        {relativeTime(row.created_at)}
                      </TableCell>
                      <TableCell className="pr-5">
                        <ApplicationStatusSelect
                          id={row.id}
                          reference={row.reference}
                          status={row.status}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>

          <Card className="gap-0 rounded-2xl border-concrete-200 bg-white py-0 shadow-none">
            <CardHeader className="border-b border-concrete-200 py-4 [.border-b]:pb-4">
              <CardTitle className="text-base">Talent community</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {talent.length === 0 ? (
                <EmptyState
                  icon={GraduationCap}
                  title="No talent profiles yet"
                  body="People who join the talent community without applying for a specific role will be listed here."
                />
              ) : (
                <ul className="divide-y divide-concrete-200">
                  {talent.map((person) => (
                    <li
                      key={person.id}
                      className="flex items-center justify-between gap-4 px-5 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {person.full_name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {person.email}
                          {person.areas_of_interest
                            ? ` · ${person.areas_of_interest}`
                            : ""}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                        {relativeTime(person.created_at)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
