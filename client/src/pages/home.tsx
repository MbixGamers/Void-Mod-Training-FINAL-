import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, UserPlus, Trophy, Gamepad, Monitor, Video, Scissors, PenTool, AlertTriangle, Bed, LogIn, LineChart } from "lucide-react";
import { Layout } from "@/components/layout";
import { motion } from "framer-motion";

export default function Home() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col space-y-12 max-w-6xl mx-auto pb-20">
        
        {/* Header Title Section */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-10 w-10 bg-accent rounded flex items-center justify-center">
            <div className="h-6 w-8 bg-background/20 rounded-sm" />
          </div>
          <h1 className="text-4xl font-display font-bold">Ticket Types</h1>
        </div>

        {/* Main Banner */}
        <Card className="p-8 bg-gradient-to-r from-card to-card/40 border-l-4 border-l-primary/50 relative overflow-hidden group">
          <div className="relative z-10 max-w-3xl">
            <p className="text-lg leading-relaxed text-muted-foreground italic">
              Your first and foremost responsibility as a mod is to efficiently manage the ticket system in Void Esports. We operate with two primary ticket categories, each requiring specific handling protocols.
            </p>
          </div>
          <div className="absolute top-0 right-0 h-full w-1/3 bg-primary/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        </Card>

        {/* Ticket Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-8 bg-card/40 border-white/5 hover:border-primary/20 transition-all">
            <div className="flex items-center gap-3 mb-6">
              <Users className="h-6 w-6 text-muted-foreground" />
              <h2 className="text-2xl font-bold font-display">General Ticket</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              These are created by community members for support inquiries, moderator assistance, or reporting issues. Handle with professionalism and follow escalation procedures for complex matters.
            </p>
          </Card>

          <Card className="p-8 bg-card/40 border-white/5 hover:border-primary/20 transition-all">
            <div className="flex items-center gap-3 mb-6">
              <UserPlus className="h-6 w-6 text-muted-foreground" />
              <h2 className="text-2xl font-bold font-display">Roster Ticket</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Application channel for users seeking to join Void Esports. Initial response must include age verification and direction to appropriate resources. Follow structured onboarding workflow.
            </p>
          </Card>
        </div>

        {/* Roster Categories Section */}
        <div className="pt-20">
          <div className="flex items-center gap-4 mb-12">
            <div className="h-10 w-10 bg-accent rounded flex items-center justify-center">
              <Trophy className="h-6 w-6" />
            </div>
            <h2 className="text-4xl font-display font-bold">Roster Categories & Requirements</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <RosterCard 
              icon={<Trophy className="h-8 w-8 text-yellow-400" />}
              title="Pro Roster"
              points={[
                "25,000+ Power Ranking",
                "$1,000+ in Official Fortnite Earnings",
                "Place and earn consistently",
                "Represent Us In Game and On Your Socials"
              ]}
            />
            <RosterCard 
              icon={<Gamepad className="h-8 w-8 text-indigo-400" />}
              title="Semi-Pro"
              points={[
                "10,000-25,000 PR",
                "Place Consistently",
                "Represent us in Game",
                "Use our Fortnite Code",
                "Must have earnings"
              ]}
            />
            <RosterCard 
              icon={<Trophy className="h-8 w-8 text-amber-600" />}
              title="Academy Roster"
              points={[
                "500-10,000 PR",
                "Place Consistently",
                "Represent us in Game",
                "Use our Fortnite Code"
              ]}
            />
            <RosterCard 
              icon={<Monitor className="h-8 w-8 text-pink-400" />}
              title="Creative Roster"
              points={[
                "Smooth/Fast Mechanics",
                "Must Be Unique",
                "Must Be Able To Provide Clips When Asked",
                "Represent Us In Game and On Your Socials"
              ]}
            />
            <RosterCard 
              icon={<Video className="h-8 w-8 text-blue-400" />}
              title="Streamer"
              points={[
                "1k+ Followers/Subscribers",
                "Average 25+ Viewers Per Stream",
                "Stream At Least 4x Per Week",
                "Use Our Hashtags in Bio/Descriptions",
                "Represent Us In Game and On Your Socials"
              ]}
            />
            <RosterCard 
              icon={<Scissors className="h-8 w-8 text-purple-400" />}
              title="Content Creator"
              points={[
                ">1k Followers on Twitch/YouTube",
                ">10k Followers on TikTok",
                "Original/High Quality Posts",
                "Willing to Help Out With Void Content",
                "Must Post Actively",
                "Represent Us In Game and On Your Socials"
              ]}
            />
          </div>
        </div>

        {/* Mod Responsibilities Section */}
        <div className="pt-20">
          <div className="flex items-center gap-4 mb-12">
            <div className="h-10 w-10 bg-accent rounded flex items-center justify-center">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="text-4xl font-display font-bold">Mod Responsibilities & Commands</h2>
          </div>

          <div className="space-y-8">
            <Card className="p-8 bg-card/40 border-white/5">
              <div className="flex items-center gap-3 mb-6">
                <AlertTriangle className="h-6 w-6" />
                <h3 className="text-2xl font-bold font-display">Warn / Report Command</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Use <code className="bg-background px-2 py-1 rounded text-primary">!warn user-id reason</code> command exclusively in the #staff-commands channel for minor rule violations. For major or repeated infractions, utilize the <code className="bg-background px-2 py-1 rounded text-primary">/report</code> command with detailed documentation.
              </p>
            </Card>

            <Card className="p-8 bg-card/40 border-white/5">
              <div className="flex items-center gap-3 mb-6">
                <Bed className="h-6 w-6" />
                <h3 className="text-2xl font-bold font-display">LOA (Leave On Application)</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                When unavailable due to illness or personal circumstances, use the <code className="bg-background px-2 py-1 rounded text-primary">/loa command</code> with clear duration and reason. Prior notification to senior staff is mandatory for extended absences.
              </p>
            </Card>

            <Card className="p-8 bg-card/40 border-white/5">
              <div className="flex items-center gap-3 mb-6">
                <LogIn className="h-6 w-6" />
                <h3 className="text-2xl font-bold font-display">Shift Management</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Begin each moderation session with <code className="bg-background px-2 py-1 rounded text-primary">/login command</code> and conclude with <code className="bg-background px-2 py-1 rounded text-primary">/logout command</code>. Failure to log hours will result in activity discrepancies and potential disciplinary action.
              </p>
            </Card>

            <Card className="p-8 bg-card/40 border-white/5">
              <div className="flex items-center gap-3 mb-6">
                <LineChart className="h-6 w-6" />
                <h3 className="text-2xl font-bold font-display">Weekly Performance Metrics</h3>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <p>Maintain minimum weekly thresholds to retain moderator status:</p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <li className="flex items-center gap-2">
                    <span className="text-primary">▸</span> 10 Tickets - Process support tickets
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">▸</span> 400 Messages - Active community engagement
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">▸</span> 5 Dyno Modlogs - Documented moderator actions
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">▸</span> 8 Hour Shift - Minimum weekly activity
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">▸</span> 2 Hours VC Time - Voice channel participation
                  </li>
                </ul>
                <div className="mt-8 p-4 bg-primary/10 border-l-4 border-l-primary rounded-r">
                  <p className="font-bold text-white">Performance below these standards triggers review and possible demotion.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Start Assessment CTA */}
        <div className="pt-20 flex justify-center">
          {user ? (
            <Link href="/test">
              <Button size="lg" className="h-16 px-12 text-xl font-bold bg-primary hover:bg-primary/90 rounded-2xl shadow-2xl shadow-primary/30">
                Proceed to Assessment
              </Button>
            </Link>
          ) : (
            <a href="/auth/discord">
              <Button size="lg" className="h-16 px-12 text-xl font-bold bg-[#5865F2] hover:bg-[#4752C4] rounded-2xl shadow-2xl shadow-indigo-500/30">
                Login to Begin Training
              </Button>
            </a>
          )}
        </div>

      </div>
    </Layout>
  );
}

function RosterCard({ icon, title, points }: { icon: React.ReactNode, title: string, points: string[] }) {
  return (
    <Card className="p-8 bg-card/40 border-white/5 hover:border-primary/20 transition-all flex flex-col h-full">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 rounded-2xl bg-background/50 border border-white/5">
          {icon}
        </div>
        <h3 className="text-2xl font-bold font-display">{title}</h3>
      </div>
      <div className="flex-1 space-y-3">
        {points.map((point, i) => (
          <div key={i} className="flex items-center gap-3 text-muted-foreground">
            <span className="text-primary text-xl">→</span>
            <span>{point}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
