"use client"
import { AuthPage } from "@/components/auth-page";
import config from "@/config";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
    const router = useRouter()

    if (!config?.auth?.enabled) {
        router.back()
    }

    return <AuthPage mode="sign-up" />;
}