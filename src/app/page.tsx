"use client";

import { useState } from "react";
import { Header } from "@/components/cover-craft/Header";
import { InformationInputForm } from "@/components/cover-craft/InformationInputForm";
import type { InformationFormValues } from "@/components/cover-craft/InformationInputForm";
import { LetterDisplay } from "@/components/cover-craft/LetterDisplay";
import { TemplateSelector } from "@/components/cover-craft/TemplateSelector";
import { PdfExportButton } from "@/components/cover-craft/PdfExportButton";
import { generateLetterDraft } from "@/ai/flows/generate-letter-draft";
import type { GenerateLetterDraftInput, GenerateLetterDraftOutput } from "@/ai/flows/generate-letter-draft";
import { improveLetterContent } from "@/ai/flows/improve-letter-content";
import type { ImproveLetterContentInput, ImproveLetterContentOutput } from "@/ai/flows/improve-letter-content";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

export default function CoverCraftPage() {
  const [userInputData, setUserInputData] = useState<GenerateLetterDraftInput | null>(null);
  const [currentLetterText, setCurrentLetterText] = useState<string>("");
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const [isLoadingImprovement, setIsLoadingImprovement] = useState(false);
  
  const { toast } = useToast();

  const handleGenerateDraft = async (data: InformationFormValues) => {
    setIsLoadingDraft(true);
    setAiSuggestions([]); // Clear previous suggestions
    setUserInputData(data); 
    try {
      const result: GenerateLetterDraftOutput = await generateLetterDraft(data);
      setCurrentLetterText(result.draft);
      toast({
        title: "Draft Generated!",
        description: "Your letter draft has been successfully generated.",
      });
    } catch (error) {
      console.error("Error generating draft:", error);
      toast({
        variant: "destructive",
        title: "Error Generating Draft",
        description: "Something went wrong. Please try again.",
      });
      setCurrentLetterText(''); // Clear text on error
    } finally {
      setIsLoadingDraft(false);
    }
  };

  const handleImproveContent = async () => {
    if (!currentLetterText.trim() || !userInputData) {
      toast({
        variant: "destructive",
        title: "Cannot Improve",
        description: "Letter content or initial user input is missing.",
      });
      return;
    }
    setIsLoadingImprovement(true);
    try {
      const improvementInput: ImproveLetterContentInput = {
        letterContent: currentLetterText,
        targetJobOrUniversity: userInputData.targetDetails,
        userBackground: userInputData.background,
      };
      const result: ImproveLetterContentOutput = await improveLetterContent(improvementInput);
      setCurrentLetterText(result.improvedContent);
      setAiSuggestions(result.suggestions);
      toast({
        title: "Content Improved!",
        description: "AI has refined your letter and provided suggestions.",
      });
    } catch (error) {
      console.error("Error improving content:", error);
      toast({
        variant: "destructive",
        title: "Error Improving Content",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoadingImprovement(false);
    }
  };

  const handleLetterContentChange = (content: string) => {
    setCurrentLetterText(content);
    // If user edits, clear AI suggestions as they might become irrelevant
    if (aiSuggestions.length > 0) {
        setAiSuggestions([]);
    }
  };
  
  const isLetterEmpty = !currentLetterText.trim();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto p-4 py-8 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="lg:sticky lg:top-8">
            <InformationInputForm onSubmit={handleGenerateDraft} isLoading={isLoadingDraft} />
          </div>
          <div className="space-y-8">
            <LetterDisplay
              letterContent={currentLetterText}
              onLetterContentChange={handleLetterContentChange}
              onImproveContent={handleImproveContent}
              aiSuggestions={aiSuggestions}
              isLoading={isLoadingImprovement || isLoadingDraft} // Combined loading for text area disable
              isInitiallyEmpty={!userInputData}
            />
            {!isLetterEmpty && (
              <>
                <Separator />
                <TemplateSelector />
                <PdfExportButton isLetterEmpty={isLetterEmpty} />
              </>
            )}
          </div>
        </div>
      </main>
      <footer className="border-t bg-card py-6 text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-4 md:px-8">
          © {new Date().getFullYear()} CoverCraft AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
