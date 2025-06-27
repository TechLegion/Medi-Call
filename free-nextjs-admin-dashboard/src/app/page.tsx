"use client";

import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  Stethoscope, 
  Building2, 
  Users, 
  Clock, 
  MapPin, 
  Shield,
  ArrowRight,
  Heart,
  Zap
} from "lucide-react";
import { apiClient } from "@/lib/api";

interface Shift {
  id: number;
  role: string;
  department: string;
  date: string;
  start_time: string;
  end_time: string;
  pay_per_hour: number;
  urgency: string;
  requirements: string;
  hospital: {
    first_name: string;
    last_name: string;
    full_address?: string;
  };
  location?: string;
}

export default function LandingPage() {
  const [featuredShift, setFeaturedShift] = useState<Shift | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedShift = async () => {
      try {
        // Fetch active shifts and get the first one as featured
        const response = await apiClient.getShifts({ status: 'active' });
        if (response.results && response.results.length > 0) {
          setFeaturedShift(response.results[0]);
        }
      } catch (error) {
        console.error('Error fetching featured shift:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedShift();
  }, []);

  // Format time for display
  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString([], { 
        weekday: 'long',
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  // Get urgency color
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'text-red-600 dark:text-red-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-green-600 dark:text-green-400';
    }
  };

  return (
    <>
      <Head>
        <title>MediCall - Emergency Medical Staffing Platform</title>
        <meta name="description" content="Connect hospitals with verified medical professionals for emergency staffing needs" />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        {/* Header */}
        <header className="relative z-10">
          <nav className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Stethoscope className="h-8 w-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900 dark:text-white">MediCall</span>
              </div>
              <div className="hidden md:flex items-center space-x-6">
                <Link href="/about" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                  About
                </Link>
                <Link href="/how-it-works" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                  How it Works
                </Link>
                <Link href="/contact" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                  Contact
                </Link>
                <Link href="/auth/signin" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">
                  Sign In
                </Link>
              </div>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="container mx-auto px-6 py-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                  Emergency Medical
                  <span className="text-blue-600 dark:text-blue-400"> Staffing</span>
                  <br />
                  Made Simple
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                  Connect hospitals facing emergency staff shortages with verified medical professionals 
                  who can volunteer or earn by temporarily filling the gap.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/auth/signup?role=hospital">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors"
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
                      className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-lg font-semibold transition-colors dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-blue-400 dark:text-blue-400"
                    >
                      <Users className="h-5 w-5" />
                      Join as a Health Worker
                      <ArrowRight className="h-4 w-4" />
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl">
                  {loading ? (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
                      </div>
                    </div>
                  ) : featuredShift ? (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {featuredShift.hospital.first_name} {featuredShift.hospital.last_name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{featuredShift.department}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className={`text-sm font-medium ${getUrgencyColor(featuredShift.urgency)}`}>
                            {featuredShift.urgency.charAt(0).toUpperCase() + featuredShift.urgency.slice(1)}: {formatDate(featuredShift.date)} {formatTime(featuredShift.start_time)}-{formatTime(featuredShift.end_time)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {featuredShift.hospital.full_address || featuredShift.location || 'Location available'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {featuredShift.requirements || 'Requirements available'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                          ${featuredShift.pay_per_hour}/hr
                        </span>
                        <Link href="/auth/signup?role=worker">
                          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                            Apply Now
                          </button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">No Active Shifts</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Be the first to post!</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">Check back soon for opportunities</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">Shifts will appear here</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">Join to see available positions</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-gray-400 dark:text-gray-500">Join Now</span>
                        <Link href="/auth/signup?role=worker">
                          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                            Get Started
                          </button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Why Choose MediCall?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Our platform connects healthcare facilities with qualified professionals 
                in real-time, ensuring quality care when it matters most.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Zap,
                  title: "Instant Matching",
                  description: "Get matched with qualified professionals in minutes, not hours."
                },
                {
                  icon: Shield,
                  title: "Verified Professionals",
                  description: "All health workers are pre-verified with valid licenses and credentials."
                },
                {
                  icon: Heart,
                  title: "Quality Care",
                  description: "Maintain high standards of patient care during staffing emergencies."
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="text-center p-6"
                >
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-blue-600 dark:bg-blue-700">
          <div className="container mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Join thousands of healthcare facilities and professionals who trust MediCall 
                for their emergency staffing needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/signup?role=hospital">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold transition-colors"
                  >
                    Join as a Hospital
                  </motion.button>
                </Link>
                <Link href="/auth/signup?role=worker">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-transparent text-white border-2 border-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-lg font-semibold transition-colors"
                  >
                    Join as a Health Worker
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Stethoscope className="h-6 w-6 text-blue-400" />
                  <span className="text-xl font-bold">MediCall</span>
                </div>
                <p className="text-gray-400">
                  Connecting healthcare facilities with qualified professionals for emergency staffing needs.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-4">For Hospitals</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="/how-it-works" className="hover:text-white">How it Works</Link></li>
                  <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                  <li><Link href="/support" className="hover:text-white">Support</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">For Health Workers</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="/opportunities" className="hover:text-white">Find Opportunities</Link></li>
                  <li><Link href="/verification" className="hover:text-white">Get Verified</Link></li>
                  <li><Link href="/earnings" className="hover:text-white">Track Earnings</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Company</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                  <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                  <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 MediCall. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
} 