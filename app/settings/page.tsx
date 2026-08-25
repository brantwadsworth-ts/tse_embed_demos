import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { hasApiKey } from "@/lib/apikeys";
import SettingsForm from "@/components/SettingsForm";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const login = (session.user as { login?: string }).login ?? "";
  const keyExists = await hasApiKey(login);

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Settings</h1>
      <SettingsForm hasKey={keyExists} />
    </div>
  );
}
