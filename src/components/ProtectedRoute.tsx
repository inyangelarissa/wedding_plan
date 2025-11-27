import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/client";
import { Heart } from "lucide-react";

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
    const navigate = useNavigate();

    const { data: userSession, isLoading: isSessionLoading } = useQuery({
        queryKey: ["session"],
        queryFn: async () => {
            const { data: { session } } = await supabase.auth.getSession();
            return session;
        },
    });

    const { data: userRole, isLoading: isRoleLoading } = useQuery({
        queryKey: ["userRole", userSession?.user?.id],
        enabled: !!userSession?.user?.id,
        queryFn: async () => {
            const { data } = await supabase
                .from("user_roles")
                .select("role")
                .eq("user_id", userSession?.user.id)
                .single();
            return data?.role;
        },
    });

    useEffect(() => {
        if (!isSessionLoading && !userSession) {
            navigate("/auth");
        }
    }, [userSession, isSessionLoading, navigate]);

    useEffect(() => {
        if (!isRoleLoading && allowedRoles && userRole && !allowedRoles.includes(userRole)) {
            // Redirect based on role if trying to access unauthorized page
            if (userRole === "vendor") navigate("/vendor-dashboard");
            else if (userRole === "venue_manager") navigate("/venue-manager");
            else navigate("/dashboard");
        }
    }, [userRole, isRoleLoading, allowedRoles, navigate]);

    if (isSessionLoading || (allowedRoles && isRoleLoading)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <Heart className="w-12 h-12 text-primary fill-primary animate-pulse mx-auto mb-4" />
                    <p className="text-muted-foreground">Verifying access...</p>
                </div>
            </div>
        );
    }

    if (!userSession) return null; // Will redirect in useEffect
    if (allowedRoles && userRole && !allowedRoles.includes(userRole)) return null; // Will redirect

    return <>{children}</>;
};

export default ProtectedRoute;
