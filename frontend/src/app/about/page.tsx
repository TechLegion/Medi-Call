"use client";

import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import { Stethoscope, Users, Building2, HeartHandshake, ShieldCheck, ArrowRight, Linkedin } from "lucide-react";

const team = [
  {
    name: "Okorie Samuel (TechLegion)",
    role: "Founder & CEO",
    image: "https://ui-avatars.com/api/?name=Okorie+Samuel&background=0D8ABC&color=fff&size=128",
    linkedin: "#"
  }
];

export default function AboutPage() {
  return (
    <>
      <Head>
        <title>About MediCall</title>
        <meta name="description" content="Learn about MediCall's mission to connect hospitals and health professionals for emergency staffing." />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 pb-20">
        {/* Header */}
        <div className="container mx-auto px-6 pt-12 pb-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="inline-flex items-center gap-2 justify-center mb-4"
          >
            <Stethoscope className="h-8 w-8 text-blue-600" />
            <span className="text-3xl font-bold text-gray-900 dark:text-white">About MediCall</span>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300"
          >
            MediCall is on a mission to ensure no hospital faces a critical staff shortage. We connect healthcare facilities with verified medical professionals—instantly, securely, and with compassion.
          </motion.p>
        </div>

        {/* How It Works */}
        <section className="container mx-auto px-6 py-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-2xl md:text-3xl font-bold text-center text-gray-900 dark:text-white mb-10"
          >
            How MediCall Works
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center"
            >
              <Building2 className="mx-auto h-10 w-10 text-blue-600 mb-4" />
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">Hospitals Post Shifts</h3>
              <p className="text-gray-600 dark:text-gray-300">Facilities in need post urgent shifts, specifying role, time, location, and requirements.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center"
            >
              <Users className="mx-auto h-10 w-10 text-blue-600 mb-4" />
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">Professionals Apply</h3>
              <p className="text-gray-600 dark:text-gray-300">Verified health workers nearby get notified and can apply or accept shifts instantly.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center"
            >
              <ShieldCheck className="mx-auto h-10 w-10 text-blue-600 mb-4" />
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">Quality & Safety</h3>
              <p className="text-gray-600 dark:text-gray-300">All professionals are pre-verified. Hospitals review applicants and confirm shifts with confidence.</p>
            </motion.div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="container mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="bg-blue-600 dark:bg-blue-700 rounded-2xl p-10 md:p-16 text-center shadow-xl"
          >
            <HeartHandshake className="mx-auto h-12 w-12 text-white mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Our Mission</h2>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              To empower healthcare systems to deliver uninterrupted, high-quality care—no matter the circumstance—by bridging the gap between urgent need and available talent.
            </p>
          </motion.div>
        </section>

        {/* Team Section */}
        <section className="container mx-auto px-6 py-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-2xl md:text-3xl font-bold text-center text-gray-900 dark:text-white mb-10"
          >
            Meet the Team
          </motion.h2>
          <div className="flex justify-center">
            {team.map((member, idx) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: idx * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center flex flex-col items-center w-full max-w-xs"
              >
                <img src={member.image} alt={member.name} className="w-20 h-20 rounded-full object-cover mb-4 border-4 border-blue-100 dark:border-blue-900" />
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">{member.name}</h3>
                <p className="text-blue-600 dark:text-blue-400 mb-2">{member.role}</p>
                <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <Linkedin className="h-4 w-4" /> LinkedIn
                </a>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
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
                <Building2 className="h-5 w-5" />
                Join as a Hospital
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </Link>
            <Link href="/auth/signup?role=worker">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-lg font-semibold transition-colors dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-blue-400 dark:text-blue-400"
              >
                <Users className="h-5 w-5" />
                Join as a Health Worker
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </Link>
          </motion.div>
        </section>
      </div>
    </>
  );
} 