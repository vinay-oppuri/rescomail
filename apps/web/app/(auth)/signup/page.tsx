import AuthSignup from "@/modules/auth/ui/auth-signup"
import { auth } from "@repo/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Suspense } from "react"

const Page = async () => {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if(!!session) {
        redirect('/dashboard')
    }

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AuthSignup />
        </Suspense>
    )
}
export default Page
