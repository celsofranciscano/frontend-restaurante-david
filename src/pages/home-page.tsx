import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { UtensilsCrossed } from "lucide-react"

export function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted p-6">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="flex size-20 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <UtensilsCrossed className="size-10" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
            Restaurante V2
          </h1>
          <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
            Sistema de gestión integral para tu restaurante
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link to="/login">Iniciar Sesión</Link>
          </Button>
       
        </div>
      </div>
    </div>
  )
}
