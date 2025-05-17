
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";
import type { GenerateLetterDraftInput } from "@/ai/flows/generate-letter-draft";
import { useEffect } from "react";

const formSchema = z.object({
  background: z.string().min(50, {
    message: "Background must be at least 50 characters.",
  }).max(5000, { message: "Background must be at most 5000 characters." }),
  targetDetails: z.string().min(10, {
    message: "Target details must be at least 10 characters.",
  }).max(1000, { message: "Target details must be at most 1000 characters." }),
  letterType: z.enum(["cover letter", "motivation letter"], {
    required_error: "You need to select a letter type.",
  }),
});

export type InformationFormValues = z.infer<typeof formSchema>;

interface InformationInputFormProps {
  onSubmit: (data: GenerateLetterDraftInput) => Promise<void>;
  isLoading: boolean;
  initialValues?: GenerateLetterDraftInput; // For pre-filling from Firestore
}

export function InformationInputForm({ onSubmit, isLoading, initialValues }: InformationInputFormProps) {
  const form = useForm<InformationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      background: initialValues?.background || "",
      targetDetails: initialValues?.targetDetails || "",
      letterType: initialValues?.letterType || undefined,
    },
  });

  useEffect(() => {
    if (initialValues) {
      form.reset({
        background: initialValues.background || "",
        targetDetails: initialValues.targetDetails || "",
        letterType: initialValues.letterType || undefined,
      });
    }
  }, [initialValues, form]);


  const handleSubmit = (values: InformationFormValues) => {
    onSubmit(values);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Create Your Letter</CardTitle>
        <CardDescription>
          Provide your details and let our AI craft the perfect letter for you. Your progress is saved automatically.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="letterType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Letter Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a letter type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cover letter">Cover Letter</SelectItem>
                      <SelectItem value="motivation letter">Motivation Letter</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="background"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Background & Experience</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about your education, work experience, skills, and achievements..."
                      className="min-h-[150px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Be detailed. This helps the AI generate a more personalized letter.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="targetDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Job or University Program</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g., Software Engineer at Google, or MSc in AI at MIT" {...field} />
                  </FormControl>
                  <FormDescription>
                    Specify the role or program you're applying for.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Generate Draft
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
