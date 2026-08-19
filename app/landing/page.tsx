import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { getUserCountryOptions } from "@/lib/thoughtspot";
import LandingClient from "@/components/LandingClient";

export default async function LandingPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/");
  }

  let countries: string[] = [];
  try {
    countries = await getUserCountryOptions(user.username);
  } catch (error) {
    console.error("Failed to load RLS-scoped country options:", error);
  }

  return <LandingClient user={user} countries={countries} />;
}
