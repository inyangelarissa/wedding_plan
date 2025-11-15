import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, DollarSign, TrendingUp, TrendingDown, PieChart } from "lucide-react";

const BudgetTracker = () => {
  const navigate = useNavigate();

  const budgetCategories = [
    { name: "Venue", allocated: 15000, spent: 12000, color: "bg-blue-500" },
    { name: "Catering", allocated: 20000, spent: 18500, color: "bg-green-500" },
    { name: "Photography", allocated: 5000, spent: 5000, color: "bg-purple-500" },
    { name: "Decoration", allocated: 8000, spent: 6200, color: "bg-pink-500" },
    { name: "Entertainment", allocated: 7000, spent: 3500, color: "bg-orange-500" },
    { name: "Miscellaneous", allocated: 5000, spent: 2100, color: "bg-yellow-500" },
  ];

  const totalAllocated = budgetCategories.reduce((sum, cat) => sum + cat.allocated, 0);
  const totalSpent = budgetCategories.reduce((sum, cat) => sum + cat.spent, 0);
  const remaining = totalAllocated - totalSpent;
  const percentageUsed = (totalSpent / totalAllocated) * 100;

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
          <h2 className="text-3xl font-serif font-bold mb-2">Budget Tracker</h2>
          <p className="text-muted-foreground">Monitor your wedding expenses and stay on track</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalAllocated.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Allocated across all categories</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">${totalSpent.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{percentageUsed.toFixed(1)}% of budget used</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Remaining</CardTitle>
              <TrendingDown className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">${remaining.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{(100 - percentageUsed).toFixed(1)}% available</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Overall Budget Progress</CardTitle>
            <CardDescription>Track your total spending against the allocated budget</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span className="font-medium">${totalSpent.toLocaleString()} / ${totalAllocated.toLocaleString()}</span>
              </div>
              <Progress value={percentageUsed} className="h-3" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Category Breakdown
            </CardTitle>
            <CardDescription>Detailed view of spending by category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {budgetCategories.map((category, idx) => {
              const percentageSpent = (category.spent / category.allocated) * 100;
              const isOverBudget = category.spent > category.allocated;

              return (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${category.color}`} />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <div className="text-sm">
                      <span className={isOverBudget ? "text-red-500 font-semibold" : ""}>
                        ${category.spent.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground"> / ${category.allocated.toLocaleString()}</span>
                    </div>
                  </div>
                  <Progress 
                    value={Math.min(percentageSpent, 100)} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{percentageSpent.toFixed(1)}% used</span>
                    <span className={isOverBudget ? "text-red-500 font-semibold" : "text-green-500"}>
                      {isOverBudget ? "Over budget" : `$${(category.allocated - category.spent).toLocaleString()} remaining`}
                    </span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BudgetTracker;
