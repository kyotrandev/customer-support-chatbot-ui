import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Header } from "@/components/auth/header"
import { Social } from "@/components/auth/social"
import { BackButton } from "@/components/auth/back-button"

interface CardWrapperProps {
  children: React.ReactNode
  headerLabel?: string
  backButtonLabel: string
  backButtonHref: string
  showSocial?: boolean
}

export const CardWrapper = ({
  children,
  headerLabel,
  backButtonLabel,
  backButtonHref,
  showSocial = true
}: CardWrapperProps) => {
  return (
    <Card className="w-full max-w-md bg-transparent backdrop-blur-lg border border-white/20 shadow-2xl">
      <CardHeader>
        <Header label={headerLabel || "Welcome to AI Assistant"} />
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
      </CardContent>
      {showSocial && (
        <CardFooter className="mt-4">
          <Social />
        </CardFooter>
      )}
      <CardFooter className="justify-center">
        <BackButton
          href={backButtonHref}
          label={backButtonLabel}
        />
      </CardFooter>
    </Card>
  )
}