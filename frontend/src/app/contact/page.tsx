"use client";

import Head from "next/head";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Mail, Phone, Send, CheckCircle } from "lucide-react";

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    // Mock API call
    await new Promise((res) => setTimeout(res, 1200));
    setSubmitted(true);
    reset();
  };

  return (
    <>
      <Head>
        <title>Contact MediCall</title>
        <meta name="description" content="Contact MediCall for support, questions, or partnership opportunities." />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 pb-20">
        <div className="container mx-auto px-6 pt-12 pb-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
          >
            Contact Us
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300"
          >
            Have a question, need support, or want to partner with MediCall? Reach out below and we'll get back to you soon.
          </motion.p>
        </div>
        <section className="container mx-auto px-6 py-12 grid md:grid-cols-2 gap-12 items-start">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8 md:mb-0"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Support</h2>
            <div className="flex items-center gap-3 mb-3">
              <Mail className="h-5 w-5 text-blue-600" />
              <span className="text-gray-700 dark:text-gray-300">support@medicall.com</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-blue-600" />
              <span className="text-gray-700 dark:text-gray-300">+1 (800) 555-1234</span>
            </div>
            <div className="mt-8 text-gray-500 text-sm">
              Our team is available 24/7 for urgent support.
            </div>
          </motion.div>
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8"
          >
            {submitted ? (
              <div className="flex flex-col items-center justify-center h-full">
                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Thank you!</h3>
                <p className="text-gray-600 dark:text-gray-300">Your message has been received. We'll get back to you soon.</p>
                <button
                  className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  onClick={() => setSubmitted(false)}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name *</label>
                  <input
                    {...register("name")}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Your Name"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email *</label>
                  <input
                    {...register("email")}
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="you@email.com"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message *</label>
                  <textarea
                    {...register("message")}
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="How can we help you?"
                  />
                  {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                  ) : (
                    <Send className="h-5 w-5 mr-2" />
                  )}
                  Send Message
                </button>
              </form>
            )}
          </motion.div>
        </section>
      </div>
    </>
  );
} 