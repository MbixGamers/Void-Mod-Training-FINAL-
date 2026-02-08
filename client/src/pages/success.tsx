import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function SuccessPage() {
  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
        >
          <Card className="max-w-md w-full p-8 text-center border-t-4 border-t-green-500 shadow-2xl bg-card">
            <div className="mb-6 flex justify-center">
              <div className="h-20 w-20 bg-green-500/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>
            </div>
            
            <h1 className="text-3xl font-display font-bold mb-4">Submission Received!</h1>
            
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Your assessment has been successfully recorded. Our automated system will review your score, and a moderator will finalize your application shortly.
            </p>

            <p className="text-sm text-muted-foreground/80 mb-8 p-4 bg-secondary/50 rounded-lg">
              Check your Discord DMs! You will receive a notification once your application has been processed.
            </p>

            <Link href="/">
              <Button variant="outline" className="w-full">
                Return Home
              </Button>
            </Link>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
