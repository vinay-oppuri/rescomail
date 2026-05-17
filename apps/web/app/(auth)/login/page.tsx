import AuthLogin from "@/modules/auth/ui/auth-login"
import { auth } from "@repo/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

const Page = async () => {
    const session = await auth.api.getSession({
      headers: await headers()
    })
  
    if(!!session) {
      redirect('/dashboard')
    }

    return (
        <AuthLogin />
    )
}
export default Page
