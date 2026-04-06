import { auth, signOut } from "@resenha/auth";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { redirect } from "next/navigation";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    // Define logout Server Action here to pass to Client Component (Sidebar)
    const handleLogout = async () => {
        "use server";
        await signOut({ redirectTo: "/login" });
    };

    return (
        <div className="admin-layout-shell flex min-h-screen flex-col bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(212,168,67,0.06),transparent_24%),#060E1A] lg:h-screen lg:flex-row lg:overflow-hidden">
            <AdminSidebar
                user={{
                    name: session.user.name || "Admin",
                    email: session.user.email || "admin@resenha.com",
                    role: session.user.role || "ADMIN",
                }}
                onLogout={handleLogout}
            />
            <main className="admin-main-shell min-w-0 flex-1 overflow-y-auto px-3 pb-4 pt-20 md:px-4 lg:px-0 lg:py-4">
                <div className="mx-auto w-full max-w-[1500px] px-1 sm:px-2">
                    {children}
                </div>
            </main>
        </div>
    );
}
