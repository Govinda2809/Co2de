"use client";

import { useState } from "react";
import { Metadata } from "next";
import { Button, Input, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setSubmitted(true);
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="py-20">
      <div className="container mx-auto px-4">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Have a question or want to work together? We'd love to hear from you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>Send us a message</CardTitle>
              <CardDescription>
                Fill out the form below and we'll get back to you as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">✅</div>
                  <h3 className="text-xl font-semibold mb-2">Thank you!</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your message has been sent. We'll be in touch soon.
                  </p>
                  <Button
                    className="mt-4"
                    variant="outline"
                    onClick={() => setSubmitted(false)}
                  >
                    Send another message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">
                      Name
                    </label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium mb-1">
                      Subject
                    </label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="What's this about?"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-1">
                      Message
                    </label>
                    <textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Your message..."
                      rows={4}
                      required
                      className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-700 dark:bg-gray-900"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Get in touch</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">📧</div>
                  <div>
                    <p className="font-medium">Email</p>
                    <a href="mailto:hello@co2de.com" className="text-blue-600 hover:underline">
                      hello@co2de.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">📍</div>
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-gray-600 dark:text-gray-400">Remote - Worldwide</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">🕐</div>
                  <div>
                    <p className="font-medium">Response Time</p>
                    <p className="text-gray-600 dark:text-gray-400">Within 24 hours</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Follow us</h3>
              <div className="flex space-x-4">
                {["GitHub", "Twitter", "LinkedIn"].map((platform) => (
                  <a
                    key={platform}
                    href="#"
                    className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900 transition-colors"
                  >
                    {platform}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
