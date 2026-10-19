import { Quote } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type TestimonialCardProps = {
  quote: string
  author: string
  role?: string | null
  avatarUrl?: string | null
  className?: string
}

const initials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()

function TestimonialCard({
  quote,
  author,
  role,
  avatarUrl,
  className,
}: TestimonialCardProps) {
  return (
    <Card
      className={cn(
        "relative w-full max-w-sm gap-0 border-none bg-muted/70 pt-0 pb-4 shadow-none",
        className
      )}
    >
      <Quote className="absolute top-3 right-2 h-16 w-16 stroke-[1.5px] text-foreground/10" />
      <CardHeader className="py-5">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            {avatarUrl && <AvatarImage src={avatarUrl} alt="" className="object-cover" />}
            <AvatarFallback>{initials(author)}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col gap-1">
            <span className="truncate text-[15px] leading-none font-semibold">
              {author}
            </span>
            {role && (
              <span className="truncate text-sm leading-none text-muted-foreground">
                {role}
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-[15px] text-muted-foreground">{quote}</p>
      </CardContent>
    </Card>
  )
}

export default TestimonialCard
