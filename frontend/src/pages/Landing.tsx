import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/src/components/ui/Button';
import { Fuel, Clock, CreditCard, ShieldCheck, MapPin, Smartphone } from 'lucide-react';
import Navbar from '@/src/components/Navbar';
import Footer from '@/src/components/Footer';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';

export default function Landing() {
  const { t } = useTranslation();

  const sectionVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.6, 
        ease: "easeOut",
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 overflow-x-hidden">
        {/* Hero Section */}
        <motion.section 
          className="relative pt-20 pb-32 overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={sectionVariants}
        >
        <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center gap-12">
          <motion.div variants={itemVariants} className="flex-1 text-center lg:text-left z-10">
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 leading-[1.1]">
              {t("Never wait in line for")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-400 dark:from-amber-400 dark:to-amber-200">{t("fuel again.")}</span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto lg:mx-0">
              {t("Locate nearby stations, check real-time fuel availability, view queue lengths, and reserve your fuel in advance with QuickFuel.")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto text-base h-12 px-8">
                  {t("Find Fuel Now")}
                </Button>
              </Link>
            </div>
          </motion.div>
          <motion.div variants={itemVariants} className="flex-1 relative z-10 w-full max-w-2xl lg:max-w-none">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200/50 dark:border-slate-800/50 aspect-[4/3]">
              {/* Using a placeholder image since I cannot directly access the uploaded image URL. You can replace this src with your actual image URL */}
              <img 
                src="src/assets/Fuel_station.webp" 
                alt="Gas Station" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 dark:from-slate-950/80 to-transparent"></div>
              
              {/* Floating UI Element */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20 dark:border-slate-700/50 flex items-center justify-between transition-all duration-300 hover:scale-[1.02] hover:bg-slate-50/95 dark:hover:bg-slate-800/95 cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-full transition-colors duration-300 group-hover:bg-amber-200 dark:group-hover:bg-amber-800/50">
                    <Fuel className="text-amber-600 dark:text-amber-400" size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">OiLibya Station</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t("Benzene")} Available • {t("Shortest Queue")}</p>
                  </div>
                </div>
                <Button size="sm" className="transition-all duration-300 group-hover:bg-amber-700 dark:group-hover:bg-amber-600 group-hover:shadow-md">{t("Reserve")}</Button>
              </div>
            </div>
            
            {/* Decorative blobs */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-amber-200/40 to-orange-200/40 dark:from-amber-900/20 dark:to-orange-900/20 blur-3xl -z-10 rounded-full"></div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        id="features" 
        className="py-24 bg-slate-50 dark:bg-slate-900/50"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={sectionVariants}
      >
        <div className="container mx-auto px-4">
          <motion.div variants={itemVariants} className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">{t("Everything you need to fuel up faster")}</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">{t("QuickFuel brings transparency and convenience to your refueling experience.")}</p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: MapPin, title: t('Locate Stations'), desc: t('Find nearby fuel stations on an interactive map with real-time distance and detailed station marker popups.') },
              { icon: Clock, title: t('Live Queue Status'), desc: t('Know before you go. Check current queue lengths to avoid long waits.') },
              { icon: Fuel, title: t('Real-time Availability'), desc: t('Stop guessing. See exactly which fuel types are currently in stock.') },
              { icon: Smartphone, title: t('Advance Reservations'), desc: t('Book your fuel slot and get a unique pickup code to guarantee your fuel.') },
              { icon: CreditCard, title: t('Digital Payments'), desc: t('Pay seamlessly via Telebirr or Chapa directly through the platform.') },
              { icon: ShieldCheck, title: t('Verified Stations'), desc: t('All stations are verified by our admins to ensure reliable service.') },
            ].map((feature, i) => (
              <motion.div variants={itemVariants} key={i} className="bg-white dark:bg-slate-950 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-lg dark:hover:shadow-amber-900/10 hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-6">
                  <feature.icon className="text-amber-600 dark:text-amber-400" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* How it works */}
      <motion.section 
        id="how-it-works" 
        className="py-24 bg-white dark:bg-slate-950"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={sectionVariants}
      >
        <div className="container mx-auto px-4">
          <motion.div variants={itemVariants} className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">{t("How QuickFuel Works")}</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">{t("Get your fuel in four simple steps.")}</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-slate-100 dark:bg-slate-800 -z-10"></div>
            
            {[
              { step: '01', title: t('Find a Station'), desc: t('Open the app and locate a nearby station with available fuel.') },
              { step: '02', title: t('Reserve Fuel'), desc: t('Select your fuel type, quantity, and preferred time slot.') },
              { step: '03', title: t('Get Your Code'), desc: t('Receive a unique pickup code and pay online via Telebirr.') },
              { step: '04', title: t('Fuel Up'), desc: t('Show your code at the station and skip the regular queue.') },
            ].map((item, i) => (
              <motion.div variants={itemVariants} key={i} className="relative text-center">
                <div className="w-16 h-16 mx-auto bg-white dark:bg-slate-900 border-4 border-amber-50 dark:border-amber-900/30 rounded-full flex items-center justify-center text-xl font-bold text-amber-600 dark:text-amber-400 mb-6 shadow-sm">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">{item.title}</h3>
                <p className="text-slate-600 dark:text-slate-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="py-20 bg-amber-600 dark:bg-amber-800"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={sectionVariants}
      >
        <motion.div variants={itemVariants} className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">{t("Ready to skip the queue?")}</h2>
          <p className="text-amber-100 text-lg mb-8 max-w-2xl mx-auto">
            {t("Join thousands of drivers who are already saving time with QuickFuel. Register today and make your next refueling stress-free.")}
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-800 h-12 px-8 text-base font-semibold">
              {t("Create Free Account")}
            </Button>
          </Link>
        </motion.div>
      </motion.section>
      </main>

      <Footer />
    </div>
  );
}
