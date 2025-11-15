import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Music, Theater, Palette, Sparkles } from "lucide-react";

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

  const aiSuggestions = [
    {
      title: "Based on Your Event Theme",
      suggestions: [
        "Traditional Henna Artist - Perfect for your cultural celebration",
        "Folk Music Band - Matches your preference for live entertainment",
        "Cultural Storyteller - Adds unique narrative element",
      ],
    },
    {
      title: "Popular in Your Area",
      suggestions: [
        "Local Dance Troupe - Highly rated by recent couples",
        "Contemporary Fusion Band - Blends traditional and modern",
        "Cultural Cuisine Demonstration - Interactive guest experience",
      ],
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

        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="browse">Browse Activities</TabsTrigger>
            <TabsTrigger value="ai-suggestions">
              <Sparkles className="w-4 h-4 mr-2" />
              AI Suggestions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
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
                      <Button className="w-full">Book Performance</Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="ai-suggestions" className="space-y-6">
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <CardTitle>Personalized Recommendations</CardTitle>
                </div>
                <CardDescription>
                  AI-powered suggestions tailored to your event preferences and cultural background
                </CardDescription>
              </CardHeader>
            </Card>

            {aiSuggestions.map((section, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle className="text-xl">{section.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {section.suggestions.map((suggestion, sIdx) => (
                    <div
                      key={sIdx}
                      className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                    >
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      <div className="flex-1">
                        <p className="font-medium">{suggestion}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Learn More
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}

            <Card className="border-dashed">
              <CardContent className="text-center py-8">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Get More Personalized Suggestions</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Complete your event profile to receive AI-powered recommendations
                </p>
                <Button>Complete Event Profile</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CulturalActivities;
