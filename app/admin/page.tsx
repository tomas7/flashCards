// app/admin/page.tsx
import { auth } from "auth"; // or from "next-auth" if you're using that
import AdminForm from "@/components/admin-form"; // component below

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) {
    return <div className="p-6 text-red-500">Access denied. Please sign in.</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      <AdminForm session={session} />
    </div>
  );
}
