import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Trophy, ShieldCheck, Gamepad } from "lucide-react";
import { Layout } from "@/components/layout";
import { motion } from "framer-motion";

export default function Home() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

  // If logged in, maybe show a different view or dashboard
  // But for now, we show the landing page with specific CTA
  
  return (
    <Layout>
      <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto pt-8 md:pt-20">
        
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Applications Open for Season 5
          </div>
          
          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 drop-shadow-sm">
            Prove Your Skill. <br/> Join the Elite.
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Take the assessment test to earn your rank and join our exclusive Discord community.
            Your journey to the top starts here.
          </p>
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 pt-4"
        >
          {user ? (
            <Link href="/test">
              <Button size="lg" className="h-14 px-8 text-lg rounded-xl shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300">
                Start Assessment <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          ) : (
            <a href="/auth/discord">
              <Button size="lg" className="h-14 px-8 text-lg rounded-xl shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300 bg-[#5865F2] hover:bg-[#4752C4]">
                Login with Discord
              </Button>
            </a>
          )}
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-20">
          <FeatureCard 
            icon={<Gamepad className="h-8 w-8 text-primary" />}
            title="Skill Assessment"
            description="A comprehensive test designed to evaluate your game knowledge and mechanics."
            delay={0.3}
          />
          <FeatureCard 
            icon={<ShieldCheck className="h-8 w-8 text-purple-400" />}
            title="Verified Role"
            description="Pass the test and automatically receive the Verified role in our Discord server."
            delay={0.4}
          />
          <FeatureCard 
            icon={<Trophy className="h-8 w-8 text-yellow-400" />}
            title="Exclusive Events"
            description="Unlock access to tournaments, scrims, and private community events."
            delay={0.5}
          />
        </div>
      </div>
    </Layout>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <Card className="h-full p-6 bg-card/40 border-white/5 backdrop-blur-sm hover:bg-card/60 hover:border-primary/20 transition-all duration-300 group">
        <div className="mb-4 p-3 rounded-xl bg-background/50 w-fit group-hover:scale-110 transition-transform duration-300 shadow-inner">
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-2 font-display">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">
          {description}
        </p>
      </Card>
    </motion.div>
  );
}
