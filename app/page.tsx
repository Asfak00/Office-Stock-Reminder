import Link from "next/link";
import { Package, Bell, BarChart3, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">StockRemind</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-4 py-24 text-center">
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
              <Bell className="h-3.5 w-3.5" />
              Never run out of office supplies again
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Smart inventory tracking for{" "}
              <span className="text-primary">modern offices</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Track coffee, tissues, and all office consumables. Get automatic email reminders
              before stock runs out. Simple, reliable, and fully automated.
            </p>
            <div className="flex items-center justify-center gap-4 pt-4">
              <Link href="/auth/signup">
                <Button size="lg" className="gap-2">
                  Start Free <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" size="lg">Sign In</Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-20">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Package,
                title: "Stock Tracking",
                desc: "Track quantity of every office consumable with real-time remaining days calculation.",
              },
              {
                icon: Bell,
                title: "Auto Reminders",
                desc: "Get email alerts before items run out. Configure reminder thresholds per item.",
              },
              {
                icon: BarChart3,
                title: "Usage Analytics",
                desc: "Visualize consumption trends, identify most-used items, and plan ahead.",
              },
              {
                icon: Mail,
                title: "Team Notifications",
                desc: "Add multiple email recipients so the whole team stays informed.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border bg-card p-6 transition-all hover:shadow-md hover:border-primary/20"
              >
                <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Office Stock Reminder — Built by <a href={'https://asfakahmed.com'} className='text-blue-600 underline' target={'_blank'}>Asfak Ahmed</a></p>
        </div>
      </footer>
    </div>
  );
}
