import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Calendar, Users, MapPin, Sparkles, Shield, TrendingUp, ChevronRight, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Index = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroImages = [
    "/Iwms1.avif",
    "/Iwms2.webp"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      icon: Calendar,
      title: "Event Planning",
      description: "Organize every detail with intelligent task management and automated reminders",
    },
    {
      icon: Users,
      title: "Vendor Directory",
      description: "Browse and book top-rated vendors with transparent pricing and reviews",
    },
    {
      icon: MapPin,
      title: "Venue Discovery",
      description: "Find your perfect venue with detailed filters and availability tracking",
    },
    {
      icon: Sparkles,
      title: "Cultural Integration",
      description: "Celebrate your heritage with curated cultural performances and exhibitions",
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Safe and transparent payment processing for all bookings",
    },
    {
      icon: TrendingUp,
      title: "Budget Analytics",
      description: "Track expenses and stay on budget with real-time insights",
    },
  ];

  const userTypes = [
    {
      title: "For Couples",
      description: "Plan your dream wedding with tools designed for you",
      benefits: ["Event timeline management", "Guest list tracking", "Budget planning"],
    },
    {
      title: "For Planners",
      description: "Manage multiple events effortlessly",
      benefits: ["Multi-event dashboard", "Client collaboration", "Vendor coordination"],
    },
    {
      title: "For Vendors",
      description: "Grow your wedding business",
      benefits: ["Profile showcase", "Booking management", "Client reviews"],
    },
    {
      title: "For Venue Managers",
      description: "Maximize your venue bookings",
      benefits: ["Availability calendar", "Pricing control", "Photo galleries"],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-white/50 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <Heart className="w-8 h-8 text-primary fill-primary" />
            <h1 className="text-2xl font-serif font-bold text-foreground">IWEMS</h1>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-4"
          >
            <Button variant="ghost" onClick={() => navigate("/auth")} className="hover:bg-primary/10">
              Login
            </Button>
            <Button variant="default" onClick={() => navigate("/auth")} className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all">
              Get Started
            </Button>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section with Carousel */}
      <section className="relative h-[90vh] overflow-hidden flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImages[currentSlide]})` }}
          />
        </AnimatePresence>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

        <div className="relative container mx-auto px-4 z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-tight text-white drop-shadow-lg">
              Your Dream Wedding,
              <span className="block text-primary-foreground/90 mt-2">Perfectly Planned</span>
            </h2>
            <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto font-light leading-relaxed drop-shadow-md">
              The complete platform for couples, planners, vendors, and venues.
              From cultural celebrations to modern elegance, we bring your vision to life.
            </p>
            <div className="flex flex-wrap gap-6 justify-center">
              <Button
                size="lg"
                className="bg-white text-black hover:bg-white/90 text-lg px-8 py-6 rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1"
                onClick={() => navigate("/auth")}
              >
                Start Planning Today
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/20 text-lg px-8 py-6 rounded-full backdrop-blur-sm transition-all"
              >
                Explore Features
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${currentSlide === index ? "bg-white w-8" : "bg-white/50 hover:bg-white/80"
                }`}
            />
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h3 className="text-4xl font-serif font-bold mb-4 text-foreground">Everything You Need</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Comprehensive tools and features designed to make wedding planning seamless and enjoyable
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-card h-full border-none hover:shadow-[var(--shadow-elegant)] transition-all duration-300 hover:-translate-y-2">
                  <CardHeader>
                    <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
                      <feature.icon className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-xl font-serif">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h3 className="text-4xl font-serif font-bold mb-4 text-foreground">Built for Everyone</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Whether you're planning, coordinating, or providing services, IWEMS has you covered
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {userTypes.map((type, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-muted bg-muted/10">
                  <CardHeader>
                    <CardTitle className="text-xl font-serif text-primary-foreground">{type.title}</CardTitle>
                    <CardDescription className="text-base">{type.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {type.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Heart className="w-4 h-4 text-primary fill-primary mt-1 flex-shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/20" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h3 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-foreground">
              Ready to Start Your Journey?
            </h3>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Join thousands of couples and professionals creating unforgettable wedding experiences
            </p>
            <Button
              size="lg"
              className="bg-foreground text-background hover:bg-foreground/90 text-lg px-10 py-6 rounded-full shadow-xl hover:shadow-2xl transition-all"
              onClick={() => navigate("/auth")}
            >
              Create Your Free Account
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-white">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Heart className="w-6 h-6 text-primary fill-primary" />
            <span className="text-xl font-serif font-bold text-foreground">IWEMS</span>
          </div>
          <p>© 2024 IWEMS - Integrated Wedding Event Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
