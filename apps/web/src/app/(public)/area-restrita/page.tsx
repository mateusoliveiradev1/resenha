import { redirect } from "next/navigation";
import { getAdminLoginUrl } from "@/lib/adminAppUrl";

export default function AreaRestritaPage() {
    redirect(getAdminLoginUrl());
}
