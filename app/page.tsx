import Link from "next/link";
import { Button } from "@/components/ui";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900" />
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
              Build Something Amazing with Co2de
            </h1>
            <p className="mt-6 text-lg text-gray-600 dark:text-gray-400">
              A modern web application platform built with Next.js 16, React 19, and TailwindCSS 4. 
              Start building your next big idea today.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">Why Choose Co2de?</h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Everything you need to build modern web applications
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Lightning Fast",
                description: "Built with performance in mind. Optimized for speed and efficiency.",
                icon: "⚡",
              },
              {
                title: "Modern Stack",
                description: "Using the latest technologies: Next.js 16, React 19, TypeScript.",
                icon: "🚀",
              },
              {
                title: "Fully Responsive",
                description: "Looks great on every device, from mobile to desktop.",
                icon: "📱",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900 hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white">Ready to Get Started?</h2>
          <p className="mt-4 text-blue-100 max-w-2xl mx-auto">
            Join thousands of developers building amazing applications with Co2de.
          </p>
          <div className="mt-8">
            <Link href="/signup">
              <Button variant="secondary" size="lg">
                Start Building Today
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
