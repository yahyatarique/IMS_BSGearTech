
import { Navigation } from "@/components/navigation";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to IMS BS GearTech</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Inventory Management System
          </p>
        </div>
      </main>
    </div>
  );
}
