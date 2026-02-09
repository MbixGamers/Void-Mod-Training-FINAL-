import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useCreateSubmission } from "@/hooks/use-submissions";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, CheckCircle2 } from "lucide-react";

const QUESTIONS = [
  {
    id: "q1",
    text: "A user creates a roster ticket with the message: 'I want to join the team, what should I do?'",
    options: ["Hello, what is your age and how may I assist you today? Please review the requirements and choose a roster.", "Sup how did you find us?", "Hey, someone else would be helping you.", "I accepted your ticket, what do you need help with?"],
    correct: "Hello, what is your age and how may I assist you today? Please review the requirements and choose a roster."
  },
  {
    id: "q2",
    text: "A user submits an application for Pro or Semi-Pro roster position.",
    options: ["Ping a fellow trial moderator.", "Give them the role they asked for.", "Request Fortnite tracker and earnings verification", "Choose to ignore and close their ticket."],
    correct: "Request Fortnite tracker and earnings verification"
  },
  {
    id: "q3",
    text: "An Academy roster applicant meets PR requirements.",
    options: ["Give them the role without verification.", "Verify Fortnite tracker authenticity and PR.", "Choose to ignore", "Ping high authority moderators."],
    correct: "Verify Fortnite tracker authenticity and PR."
  },
  {
    id: "q4",
    text: "A user applies for Streamer or Content Creator position.",
    options: ["Ask their PR and tracker link.", "Choose to ignore / Close their ticket.", "Ping @Creative Department.", "Ask for socials and check their content & follower requirements."],
    correct: "Ask for socials and check their content & follower requirements."
  },
  {
    id: "q5",
    text: "A GFX/VFX applicant submits their portfolio.",
    options: ["Give them role directly.", "Request portfolio and proof of work & ping @GFX/VFX Lead.", "Ignore their request.", "Ping @Content Department."],
    correct: "Request portfolio and proof of work & ping @GFX/VFX Lead."
  },
  {
    id: "q6",
    text: "A Creative roster applicant provides freebuilding clips.",
    options: ["Ping @Content Department", "Request portfolio and give them roles directly.", "Ignore their request.", "Ask for 2-3 clips including one freebuild. After sending, ping @Creative Department."],
    correct: "Ask for 2-3 clips including one freebuild. After sending, ping @Creative Department."
  },
  {
    id: "q7",
    text: "A Grinder applicant seeks representation.",
    options: ["Ask them to include Void in their username. Use the creator code Team.Void in shop. Verify them.", "Give a 12 year old grinder directly.", "Ignore their request.", "Ping higher authority moderators."],
    correct: "Ask them to include Void in their username. Use the creator code Team.Void in shop. Verify them."
  },
];

const formSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string(),
    answer: z.string()
  }))
});

export default function TestPage() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const createSubmission = useCreateSubmission();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      answers: []
    }
  });

  if (isLoading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (!user) {
    setLocation("/");
    return null;
  }

  const handleNext = () => {
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    let correctCount = 0;
    const formattedAnswers = data.answers.reduce((acc, curr) => {
      const q = QUESTIONS.find(q => q.id === curr.questionId);
      if (q && q.correct === curr.answer) correctCount++;
      return { ...acc, [curr.questionId]: curr.answer };
    }, {});

    const score = Math.round((correctCount / QUESTIONS.length) * 100);
    const passed = score >= 80;

    createSubmission.mutate({
      userId: user.id,
      answers: formattedAnswers,
      score,
      passed
    }, {
      onSuccess: () => setLocation("/success")
    });
  };

  const progress = ((currentQuestionIndex + 1) / QUESTIONS.length) * 100;
  const currentQuestion = QUESTIONS[currentQuestionIndex];

  // Watch the current answer for UI logic
  const currentAnswer = form.watch(`answers.${currentQuestionIndex}`)?.answer;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto pt-8 px-4 pb-20">
        <div className="mb-8 space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground font-medium mb-2">
            <span>Question {currentQuestionIndex + 1} of {QUESTIONS.length}</span>
            <span>{Math.round(progress)}% Completed</span>
          </div>
          <Progress value={progress} className="h-2 bg-secondary" />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card className="border-t-4 border-t-primary shadow-2xl bg-card overflow-hidden">
              <CardHeader>
                <CardTitle className="text-2xl font-display">Knowledge Assessment</CardTitle>
                <CardDescription>Select the best answer for each question.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentQuestion.id}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FormField
                      control={form.control}
                      name={`answers.${currentQuestionIndex}`}
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormLabel className="text-lg font-medium leading-relaxed block mb-6">
                            {currentQuestion.text}
                          </FormLabel>
                          <FormControl>
                            <RadioGroup
                              // Sync RadioGroup value with form state
                              value={field.value?.answer || ""}
                              onValueChange={(val) => {
                                const currentAnswers = [...form.getValues("answers")];
                                currentAnswers[currentQuestionIndex] = {
                                  questionId: currentQuestion.id,
                                  answer: val
                                };
                                // shouldValidate triggers the UI update for highlighting
                                form.setValue("answers", currentAnswers, { shouldValidate: true });
                              }}
                              className="flex flex-col space-y-3"
                            >
                              {currentQuestion.options.map((option) => {
                                const isSelected = currentAnswer === option;

                                return (
                                  <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem 
                                        value={option} 
                                        id={`${currentQuestion.id}-${option}`} 
                                        className="sr-only" 
                                      />
                                    </FormControl>
                                    <Label
                                      htmlFor={`${currentQuestion.id}-${option}`}
                                      className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex items-center gap-3 ${
                                        isSelected 
                                          ? "border-primary bg-primary/10 text-primary font-semibold shadow-md ring-1 ring-primary" 
                                          : "border-border hover:border-primary/50 hover:bg-secondary/50"
                                      }`}
                                    >
                                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                        isSelected ? "border-primary bg-primary" : "border-muted-foreground"
                                      }`}>
                                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                      </div>
                                      {option}
                                    </Label>
                                  </FormItem>
                                );
                              })}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                </AnimatePresence>

                <div className="flex justify-end pt-6 mt-6 border-t border-border/50">
                  {currentQuestionIndex < QUESTIONS.length - 1 ? (
                    <Button 
                      type="button" 
                      onClick={handleNext}
                      disabled={!currentAnswer}
                      className="px-8"
                    >
                      Next Question <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button 
                      type="submit" 
                      disabled={createSubmission.isPending || !currentAnswer}
                      className="px-8 bg-green-600 hover:bg-green-700 text-white"
                    >
                      {createSubmission.isPending ? "Submitting..." : "Submit Assessment"}
                      {!createSubmission.isPending && <CheckCircle2 className="ml-2 h-4 w-4" />}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>
      </div>
    </Layout>
  );
}