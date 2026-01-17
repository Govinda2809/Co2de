import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About",
  description: "Learn more about Co2de and our mission",
};

export default function AboutPage() {
  return (
    <div className="py-20">
      <div className="container mx-auto px-4">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">About Co2de</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            We're on a mission to make web development accessible, efficient, and enjoyable for everyone.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-3xl font-bold mb-4">Our Story</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Co2de started with a simple idea: make building web applications easier and more enjoyable. 
              We believe that great tools should empower developers, not slow them down.
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Today, we're building the next generation of web development tools, 
              combining cutting-edge technology with intuitive design.
            </p>
          </div>
          <div className="relative h-64 md:h-96 rounded-xl overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-6xl">🚀</div>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Innovation",
                description: "We constantly push boundaries to deliver cutting-edge solutions.",
                icon: "💡",
              },
              {
                title: "Quality",
                description: "We take pride in crafting polished, reliable products.",
                icon: "✨",
              },
              {
                title: "Community",
                description: "We build together and grow together with our community.",
                icon: "🤝",
              },
            ].map((value, index) => (
              <div key={index} className="text-center p-6">
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Meet the Team</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-12">
            A passionate group of developers and designers working to make your experience better.
          </p>
          <div className="flex justify-center">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                G
              </div>
              <h3 className="font-semibold">Govinda</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Founder & Developer</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
