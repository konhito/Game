"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft, Mail, MessageSquare, Send, CheckCircle } from "lucide-react";
import config from "@/lib/config";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setError("");
    try {
      const response = await fetch(`${config.API_BASE}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Message could not be sent. Please try again.");
      }
      setIsSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (cause) {
      setError(cause instanceof TypeError ? "Could not connect to Pinecrest. Refresh and try again." : cause instanceof Error ? cause.message : "Message could not be sent. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 shadow-xl">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Message Sent!</h2>
            <p className="text-slate-600 mb-6">
              Thank you for contacting us. We'll get back to you as soon as possible.
            </p>
            <Button onClick={() => setIsSubmitted(false)} variant="outline">
              Send Another Message
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to home
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[var(--pine)]">
              Get in Touch
            </h1>
            <p className="text-lg text-slate-600 mb-8">
              Have a question or need help? Send us a message through this form.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-100 rounded-lg">
                  <Mail className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Email</h3>
                  <p className="text-slate-600">Use the form to send us a message.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Replies</h3>
                      <p className="text-slate-600">We&apos;ll reply to the email address you provide.</p>
                </div>
              </div>
            </div>
          </div>

          <Card className="shadow-xl border-0">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    minLength={2}
                    maxLength={100}
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    maxLength={254}
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    minLength={2}
                    maxLength={120}
                    value={formData.subject}
                    onChange={handleChange}
                    className="mt-1"
                    placeholder="What's this about?"
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    minLength={10}
                    maxLength={5000}
                    value={formData.message}
                    onChange={handleChange}
                    className="mt-1 min-h-[120px]"
                    placeholder="Tell us how we can help..."
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:opacity-90"
                >
                  {isSubmitting ? (
                    <>Sending...</>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
                {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


