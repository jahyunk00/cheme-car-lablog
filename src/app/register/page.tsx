import { AuthCard } from "@/components/AuthCard";
import { RegisterForm } from "@/components/RegisterForm";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <AuthCard
      title="Create an account"
      subtitle="Join your team’s lab log. New accounts are members; ask an admin if you need elevated access."
      footer={
        <p className="text-xs text-slate-500 text-center leading-relaxed">
          By creating an account you can add logs, use the calendar, and see team activity. Use a work email if your
          group expects it.
        </p>
      }
    >
      <RegisterForm />
    </AuthCard>
  );
}
