import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Music, Theater, Palette } from "lucide-react";

const CulturalActivities = () => {
  const navigate = useNavigate();

  const performances = [
    {
      id: 1,
      name: "Traditional Dance Ensemble",
      type: "Dance Performance",
      description: "Experience authentic cultural dances performed by skilled artists",
      duration: "45 minutes",
      price: "$800",
      icon: Music,
    },
    {
      id: 2,
      name: "Classical Orchestra",
      type: "Musical Performance",
      description: "Live classical music to create an elegant atmosphere",
      duration: "2 hours",
      price: "$1,500",
      icon: Theater,
    },
    {
      id: 3,
      name: "Cultural Art Exhibition",
      type: "Visual Arts",
      description: "Curated display of traditional artworks and crafts",
      duration: "Full event",
      price: "$1,200",
      icon: Palette,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      <nav className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-serif font-bold mb-2">Cultural Activities</h2>
          <p className="text-muted-foreground">
            Enrich your celebration with traditional performances and cultural elements
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Cultural Performances</CardTitle>
              <CardDescription>
                Browse traditional performances and cultural activities to enrich your celebration
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {performances.map((performance) => {
              const Icon = performance.icon;
              return (
                <Card key={performance.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <Badge variant="secondary">{performance.type}</Badge>
                    </div>
                    <CardTitle className="text-xl font-serif">{performance.name}</CardTitle>
                    <CardDescription>{performance.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-medium">{performance.duration}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Price:</span>
                      <span className="font-semibold text-primary">{performance.price}</span>
                    </div>
                    <Button className="w-full" variant="outline" disabled>
                      Coming Soon
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CulturalActivities;
