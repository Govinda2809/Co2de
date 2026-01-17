import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";

export const metadata: Metadata = {
  title: "Services",
  description: "Explore our range of services",
};

const services = [
  {
    title: "Web Development",
    description: "Custom web applications built with modern technologies like Next.js, React, and TypeScript.",
    features: ["Responsive Design", "SEO Optimized", "Fast Performance"],
    icon: "🌐",
  },
  {
    title: "Mobile Apps",
    description: "Cross-platform mobile applications that work seamlessly on iOS and Android.",
    features: ["React Native", "Native Performance", "Offline Support"],
    icon: "📱",
  },
  {
    title: "UI/UX Design",
    description: "Beautiful, intuitive designs that put user experience first.",
    features: ["User Research", "Prototyping", "Design Systems"],
    icon: "🎨",
  },
  {
    title: "API Development",
    description: "Robust and scalable APIs to power your applications.",
    features: ["RESTful APIs", "GraphQL", "Real-time"],
    icon: "⚙️",
  },
  {
    title: "Cloud Solutions",
    description: "Cloud infrastructure setup and management for optimal performance.",
    features: ["AWS/GCP/Azure", "Auto Scaling", "Security"],
    icon: "☁️",
  },
  {
    title: "Consulting",
    description: "Expert guidance on technology choices and architecture decisions.",
    features: ["Tech Strategy", "Code Reviews", "Mentoring"],
    icon: "💼",
  },
];

export default function ServicesPage() {
  return (
    <div className="py-20">
      <div className="container mx-auto px-4">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Our Services</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            We offer a comprehensive range of services to help you build and grow your digital presence.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="text-4xl mb-2">{service.icon}</div>
                <CardTitle>{service.title}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="mr-2 text-green-500">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
