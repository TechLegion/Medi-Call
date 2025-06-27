"use client";

import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import { Building2, Users, ShieldCheck, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Building2,
    title: "Hospitals Post Shifts",
    description: "Facilities in need post urgent shifts, specifying role, time, location, and requirements."
  },
  {
    icon: Users,
    title: "Professionals Get Notified",
    description: "Verified health workers nearby receive instant notifications and can apply or accept shifts."
  },
  {
    icon: ShieldCheck,
    title: "Review & Confirm",
    description: "Hospitals review applicants, verify credentials, and confirm the right fit for each shift."
  }
];

export default function HowItWorksPage() {
  return (
    <>
      <Head>
        <title>How MediCall Works</title>
        <meta name="description" content="How MediCall connects hospitals and health professionals for emergency staffing." />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 pb-20">
        <div className="container mx-auto px-6 pt-12 pb-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
          >
            How MediCall Works
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300"
          >
            Seamlessly connect hospitals facing staff shortages with qualified, verified medical professionals—fast, secure, and reliable.
          </motion.p>
        </div>
        <section className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, idx) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: idx * 0.15 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center flex flex-col items-center"
              >
                <step.icon className="mx-auto h-12 w-12 text-blue-600 mb-4" />
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </section>
        <section className="container mx-auto px-6 py-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="inline-flex flex-col md:flex-row gap-4 justify-center items-center"
          >
            <Link href="/auth/signup?role=hospital">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors"
              >
                Post a Shift
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </Link>
            <Link href="/auth/signup?role=worker">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-lg font-semibold transition-colors dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-blue-400 dark:text-blue-400"
              >
                Find Shifts
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </Link>
          </motion.div>
        </section>
      </div>
    </>
  );
} 