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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, CheckCircle2, AlertCircle } from "lucide-react";

// Mock questions - in a real app these might come from the API
const QUESTIONS = [
  {
    id: "q1",
    text: "What is the primary objective in the ranked game mode?",
    options: ["Capture the flag", "Defeat the boss", "Control the zones", "Survive"],
    correct: "Control the zones" // Just for context, validation happens on server normally or handled here
  },
  {
    id: "q2",
    text: "Which character class has the highest base movement speed?",
    options: ["Tank", "Assassin", "Mage", "Support"],
    correct: "Assassin"
  },
  {
    id: "q3",
    text: "What is the cooldown of the ultimate ability 'Meteor Strike'?",
    options: ["60s", "90s", "120s", "150s"],
    correct: "120s"
  },
  {
    id: "q4",
    text: "How much gold does the Dragon objective grant to the team?",
    options: ["100", "200", "300", "500"],
    correct: "300"
  },
  {
    id: "q5",
    text: "Which item provides immunity to crowd control effects?",
    options: ["Aegis Shield", "Quicksilver Sash", "Guardian Angel", "Spirit Visage"],
    correct: "Quicksilver Sash"
  }
];

// Dynamically generate Zod schema based on questions
const formSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string(),
    answer: z.string()
  })).min(QUESTIONS.length, "Please answer all questions")
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

  // Redirect if not logged in
  if (!isLoading && !user) {
    setLocation("/");
    return null;
  }

  const handleNext = () => {
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    // Calculate simple score locally or send raw answers
    // Here we'll calculate a score just to satisfy the schema requirement 
    // In a real secure app, scoring happens on backend
    let correctCount = 0;
    const formattedAnswers = data.answers.reduce((acc, curr) => {
      const q = QUESTIONS.find(q => q.id === curr.questionId);
      if (q && q.correct === curr.answer) correctCount++;
      return { ...acc, [curr.questionId]: curr.answer }; // Store as object or array
    }, {});

    const score = Math.round((correctCount / QUESTIONS.length) * 100);
    const passed = score >= 80; // 80% pass rate

    createSubmission.mutate({
      userId: user!.id,
      answers: formattedAnswers,
      score,
      passed
    }, {
      onSuccess: () => setLocation("/success")
    });
  };

  const progress = ((currentQuestionIndex + 1) / QUESTIONS.length) * 100;
  const currentQuestion = QUESTIONS[currentQuestionIndex];

  return (
    <Layout>
      <div className="max-w-2xl mx-auto pt-8">
        <div className="mb-8 space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground font-medium mb-2">
            <span>Question {currentQuestionIndex + 1} of {QUESTIONS.length}</span>
            <span>{Math.round(progress)}% Completed</span>
          </div>
          <Progress value={progress} className="h-2 bg-secondary" />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card className="border-t-4 border-t-primary shadow-2xl bg-card">
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
                              onValueChange={(val) => {
                                // Update the array form value manually
                                const currentAnswers = form.getValues("answers") || [];
                                const newAnswers = [...currentAnswers];
                                newAnswers[currentQuestionIndex] = {
                                  questionId: currentQuestion.id,
                                  answer: val
                                };
                                form.setValue("answers", newAnswers);
                              }}
                              className="flex flex-col space-y-3"
                            >
                              {currentQuestion.options.map((option) => {
                                const isSelected = form.watch(`answers.${currentQuestionIndex}`)?.answer === option;
                                return (
                                  <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value={option} id={`${currentQuestion.id}-${option}`} className="sr-only" />
                                    </FormControl>
                                    <Label
                                      htmlFor={`${currentQuestion.id}-${option}`}
                                      className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                                        isSelected 
                                          ? "border-primary bg-primary/10 text-primary font-semibold shadow-inner" 
                                          : "border-border hover:border-primary/50 hover:bg-secondary/50"
                                      }`}
                                    >
                                      <div className="flex items-center">
                                        <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                                          isSelected ? "border-primary" : "border-muted-foreground"
                                        }`}>
                                          {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                        </div>
                                        {option}
                                      </div>
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
                      disabled={!form.watch(`answers.${currentQuestionIndex}`)}
                      className="px-8"
                    >
                      Next Question <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button 
                      type="submit" 
                      disabled={createSubmission.isPending || !form.watch(`answers.${currentQuestionIndex}`)}
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
