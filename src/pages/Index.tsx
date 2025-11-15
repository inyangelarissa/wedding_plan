import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Calendar, Users, MapPin, Sparkles, Shield, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
// import heroImage from "@/assets/image.jpg";
const Index = () => {
  const navigate = useNavigate();

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
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-primary fill-primary" />
            <h1 className="text-2xl font-serif font-bold">IWEMS</h1>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => navigate("/auth")}>
              Login
            </Button>
            <Button variant="hero" onClick={() => navigate("/auth")}>
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          // style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60" />
        </div>
        <div className="relative container mx-auto px-4 py-32">
          <div className="max-w-2xl">
            <h2 className="text-5xl md:text-6xl font-serif font-bold mb-6 leading-tight">
              Your Dream Wedding,
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> Perfectly Planned</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              The complete platform for couples, planners, vendors, and venues. 
              From cultural celebrations to modern elegance, we bring your vision to life.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" variant="hero" onClick={() => navigate("/auth")}>
                Start Planning Today
              </Button>
              <Button size="lg" variant="outline">
                Explore Features
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-serif font-bold mb-4">Everything You Need</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools and features designed to make wedding planning seamless and enjoyable
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:shadow-[var(--shadow-elegant)] transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <feature.icon className="w-12 h-12 text-primary mb-4" />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-serif font-bold mb-4">Built for Everyone</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Whether you're planning, coordinating, or providing services, IWEMS has you covered
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {userTypes.map((type, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl">{type.title}</CardTitle>
                  <CardDescription>{type.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {type.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Heart className="w-4 h-4 text-primary fill-primary mt-1 flex-shrink-0" />
                        <span className="text-sm">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-4xl font-serif font-bold mb-6">
            Ready to Start Your Journey?
          </h3>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of couples and professionals creating unforgettable wedding experiences
          </p>
          <Button size="lg" variant="hero" onClick={() => navigate("/auth")}>
            Create Your Free Account
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-card">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2024 IWEMS - Integrated Wedding Event Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
