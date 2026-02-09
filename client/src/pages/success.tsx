import { Link, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle, Trophy, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";

export default function SuccessPage() {
  const { user } = useAuth();

  // We use search params or state to determine if they passed
  // If you aren't passing state via wouter, you'd usually fetch the 
  // latest submission from your useSubmissions hook here.

  // For this example, let's assume the user is redirected here after a successful submit.
  // You can enhance this by fetching the actual score from the backend.
  const isPassed = true; // Replace with logic: latestSubmission.score >= 80

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[70vh] px-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="max-w-md w-full"
        >
          <Card className={`p-8 text-center border-t-4 shadow-2xl bg-card ${
            isPassed ? "border-t-green-500" : "border-t-red-500"
          }`}>
            <div className="mb-6 flex justify-center">
              <div className={`h-24 w-24 rounded-full flex items-center justify-center ${
                isPassed ? "bg-green-500/10" : "bg-red-500/10"
              }`}>
                {isPassed ? (
                  <Trophy className="h-12 w-12 text-green-500" />
                ) : (
                  <XCircle className="h-12 w-12 text-red-500" />
                )}
              </div>
            </div>

            <h1 className="text-3xl font-display font-bold mb-2">
              {isPassed ? "Assessment Passed!" : "Assessment Failed"}
            </h1>

            <div className="inline-block px-4 py-1 rounded-full bg-secondary text-sm font-medium mb-6">
              Authenticated as {user?.username}
            </div>

            <p className="text-muted-foreground mb-8 leading-relaxed">
              {isPassed 
                ? "Excellent work! You've met the requirements. Our team will review your application and finalize your role shortly."
                : "Unfortunately, you didn't reach the 80% passing score required for this role. Review the materials and try again."
              }
            </p>

            {isPassed ? (
              <div className="text-sm text-muted-foreground/80 mb-8 p-4 bg-green-500/5 border border-green-500/20 rounded-lg flex items-start gap-3 text-left">
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <p>Check your Discord DMs! Our bot will notify you once the moderator review is complete.</p>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground/80 mb-8 p-4 bg-red-500/5 border border-red-500/20 rounded-lg flex items-start gap-3 text-left">
                <RotateCcw className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <p>You can re-take the assessment after reviewing the documentation.</p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {!isPassed && (
                <Link href="/test">
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    Try Again
                  </Button>
                </Link>
              )}
              <Link href="/">
                <Button variant="outline" className="w-full">
                  Return Home
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}