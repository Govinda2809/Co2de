import Link from "next/link";
import { Upload, Zap, Leaf, BarChart3, Sparkles, ArrowRight, CheckCircle } from "lucide-react";

const features = [
  {
    icon: Upload,
    title: "Upload Your Code",
    description: "Drag and drop any code file. We support JavaScript, TypeScript, Python, Java, Rust, Go, and more.",
  },
  {
    icon: Zap,
    title: "Instant Analysis",
    description: "Get immediate estimates of your code's energy consumption and carbon footprint.",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Insights",
    description: "Receive intelligent recommendations to optimize your code for environmental efficiency.",
  },
  {
    icon: BarChart3,
    title: "Visual Dashboard",
    description: "Track your code's impact with beautiful, real-time visualizations and metrics.",
  },
];

const benefits = [
  "Reduce your software's carbon footprint",
  "Identify energy-intensive code patterns",
  "Get actionable optimization tips",
  "Track improvements over time",
  "Contribute to sustainable development",
  "Free and open source",
];

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-950 dark:to-emerald-950/20" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-medium mb-8">
            <Leaf className="w-4 h-4" />
            Sustainable Software Development
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6">
            Understand Your Code's
            <br />
            <span className="gradient-text">Environmental Impact</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10">
            CO2DE helps developers instantly analyze the energy consumption and CO₂ footprint of their code,
            with AI-powered insights for building greener software.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/analyze"
              className="group flex items-center gap-2 px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-lg transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
            >
              <Upload className="w-5 h-5" />
              Analyze Your Code
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/about"
              className="flex items-center gap-2 px-8 py-4 rounded-xl border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 font-semibold text-lg transition-all"
            >
              Learn More
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {[
              { value: "100+", label: "File Types" },
              { value: "< 5s", label: "Analysis Time" },
              { value: "Free", label: "Forever" },
              { value: "OSS", label: "Open Source" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-emerald-500">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              Four simple steps to understand and reduce your code's environmental footprint
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="relative p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 hover:border-emerald-500/50 transition-all group"
              >
                <div className="absolute top-4 right-4 text-4xl font-bold text-gray-100 dark:text-gray-800 group-hover:text-emerald-500/20 transition-colors">
                  {index + 1}
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 w-fit mb-4">
                  <feature.icon className="w-6 h-6 text-emerald-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-emerald-500 to-teal-600">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Why Green Software Matters
              </h2>
              <p className="text-emerald-100 mb-8">
                The tech industry accounts for approximately 2-4% of global carbon emissions.
                By making our code more efficient, we can collectively make a significant impact
                on reducing our environmental footprint.
              </p>
              <ul className="space-y-3">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3 text-white">
                    <CheckCircle className="w-5 h-5 text-emerald-200 shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-white/10 rounded-3xl blur-xl" />
              <div className="relative p-8 rounded-2xl bg-white/10 backdrop-blur border border-white/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-white/20">
                    <Leaf className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-white font-semibold">Sample Analysis</span>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-100">Energy Score</span>
                    <span className="text-2xl font-bold text-white">8/10</span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full w-4/5 bg-white rounded-full" />
                  </div>
                  <div className="pt-4 border-t border-white/20">
                    <p className="text-sm text-emerald-100">
                      "Consider using Promise.all for parallel async operations to reduce execution time by 25%"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Make Your Code Greener?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto mb-8">
            Start analyzing your code today. It's free, fast, and helps the planet.
          </p>
          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-lg transition-all shadow-lg shadow-emerald-500/25"
          >
            <Upload className="w-5 h-5" />
            Start Analyzing
          </Link>
        </div>
      </section>
    </div>
  );
}
