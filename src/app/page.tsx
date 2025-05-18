
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
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
import { useAuth } from "@/contexts/AuthContext";
import { saveUserLetter, getUserLetter, type UserLetterData } from "@/services/firestoreService";
import { Loader2 } from "lucide-react";

// Debounce helper
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };

  return debounced as (...args: Parameters<F>) => ReturnType<F>;
}


export default function CoverCraftPage() {
  const { user, loading: authLoading, skipLoginModeActive } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [userInputData, setUserInputData] = useState<GenerateLetterDraftInput | null>(null);
  const [currentLetterText, setCurrentLetterText] = useState<string>("");
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const [isLoadingImprovement, setIsLoadingImprovement] = useState(false);
  const [isLoadingPersistence, setIsLoadingPersistence] = useState(true); // For loading/saving from Firestore

  const hasLoadedFromFirestore = useRef(false);


  // Debounced save function
  const debouncedSave = useCallback(
    debounce(async (uid: string, inputData: GenerateLetterDraftInput | null, letterText: string) => {
      if (!uid) {
        console.warn("Debounced save: No UID available, skipping save.");
        return;
      }
      if (!inputData && !letterText) {
        console.info("Debounced save: No input data or letter text to save, skipping.");
        return;
      }

      setIsLoadingPersistence(true);
      try {
        await saveUserLetter(uid, inputData, letterText);
        console.log("Letter saved successfully for user:", uid);
      } catch (error) {
        console.error("Error saving letter (debouncedSave):", error);
        let errorMessage = "Could not save your letter. Please try again.";
        if (error instanceof Error) {
            errorMessage = `Could not save your letter: ${error.message}`;
        }
        toast({
          variant: "destructive",
          title: "Save Failed",
          description: errorMessage,
        });
      } finally {
        setIsLoadingPersistence(false);
      }
    }, 1500), 
  [toast]);

  // Effect for redirecting and loading initial data
  useEffect(() => {
    if (!authLoading && !user && !skipLoginModeActive) {
      router.push("/auth");
    } else if (user && !hasLoadedFromFirestore.current) {
      setIsLoadingPersistence(true);
      getUserLetter(user.uid)
        .then((savedData) => {
          if (savedData) {
            setUserInputData(savedData.userInputData);
            setCurrentLetterText(savedData.currentLetterText);
            toast({ title: "Draft Loaded", description: "Your previously saved draft has been loaded."});
          } else {
            console.info("No saved draft found for user:", user.uid);
            // This is not an error, just no data.
          }
        })
        .catch((error) => {
          console.error("Error loading letter (useEffect):", error);
          // Only show toast for unexpected errors, not for "No draft found" which is handled by getUserLetter returning null
          if (error instanceof Error && error.message.toLowerCase() !== "no draft found") {
            toast({
              variant: "destructive",
              title: "Load Failed",
              description: `Could not load your saved letter: ${error.message}`,
            });
          }
        })
        .finally(() => {
          setIsLoadingPersistence(false);
          hasLoadedFromFirestore.current = true;
        });
    } else if (skipLoginModeActive && !hasLoadedFromFirestore.current) { 
      setIsLoadingPersistence(false);
      hasLoadedFromFirestore.current = true;
    }
  }, [user, authLoading, router, toast, skipLoginModeActive]);


  // Effect for auto-saving when relevant state changes
  useEffect(() => {
    if (user && hasLoadedFromFirestore.current) { 
      debouncedSave(user.uid, userInputData, currentLetterText);
    }
  }, [userInputData, currentLetterText, user, debouncedSave]);


  const handleGenerateDraft = async (data: InformationFormValues) => {
    if (!user && !skipLoginModeActive) { 
       toast({ variant: "destructive", title: "Not Logged In", description: "Please log in or use 'Skip Login' to generate a draft." });
       return;
    }
    setIsLoadingDraft(true);
    setAiSuggestions([]); 
    setUserInputData(data); 
    try {
      console.log("Attempting to generate draft with input:", data);
      const result: GenerateLetterDraftOutput = await generateLetterDraft(data);
      setCurrentLetterText(result.draft); 
      console.log("Draft generated successfully:", result);
      toast({
        title: "Draft Generated!",
        description: "Your letter draft has been successfully generated and saved.",
      });
    } catch (error) {
      console.error("Error generating draft (handleGenerateDraft):", error);
      let errorMessage = "Something went wrong. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        variant: "destructive",
        title: "Error Generating Draft",
        description: errorMessage,
      });
      setCurrentLetterText(''); 
    } finally {
      setIsLoadingDraft(false);
    }
  };

  const handleImproveContent = async () => {
    if (!user && !skipLoginModeActive) { 
      toast({ variant: "destructive", title: "Not Logged In", description: "Please log in or use 'Skip Login' to improve content." });
      return;
    }
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
      console.log("Attempting to improve content with input:", improvementInput);
      const result: ImproveLetterContentOutput = await improveLetterContent(improvementInput);
      setCurrentLetterText(result.improvedContent); 
      setAiSuggestions(result.suggestions);
      console.log("Content improved successfully:", result);
      toast({
        title: "Content Improved!",
        description: "AI has refined your letter, and changes are saved.",
      });
    } catch (error) {
      console.error("Error improving content (handleImproveContent):", error);
      let errorMessage = "Something went wrong. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        variant: "destructive",
        title: "Error Improving Content",
        description: errorMessage,
      });
    } finally {
      setIsLoadingImprovement(false);
    }
  };

  const handleLetterContentChange = (content: string) => {
    setCurrentLetterText(content); 
    if (aiSuggestions.length > 0) {
        setAiSuggestions([]);
    }
  };
  
  const isLetterEmpty = !currentLetterText.trim();
  const showInitialLoadingScreen = (authLoading && !skipLoginModeActive) || (isLoadingPersistence && !hasLoadedFromFirestore.current);


  if (showInitialLoadingScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading your CoverCraft experience...</p>
      </div>
    );
  }
  
  if (!user && !skipLoginModeActive) { 
     return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-lg text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto p-4 py-8 md:p-8">
        { (isLoadingDraft || isLoadingImprovement || (isLoadingPersistence && hasLoadedFromFirestore.current)) && (
            <div className="fixed top-20 right-8 z-50 flex items-center space-x-2 rounded-md bg-primary/10 p-2 text-sm text-primary backdrop-blur-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
            </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="lg:sticky lg:top-8">
            <InformationInputForm 
              onSubmit={handleGenerateDraft} 
              isLoading={isLoadingDraft}
              initialValues={userInputData || undefined}
            />
          </div>
          <div className="space-y-8">
            <LetterDisplay
              letterContent={currentLetterText}
              onLetterContentChange={handleLetterContentChange}
              onImproveContent={handleImproveContent}
              aiSuggestions={aiSuggestions}
              isLoading={isLoadingDraft || isLoadingImprovement} 
              isInitiallyEmpty={!userInputData && !currentLetterText && hasLoadedFromFirestore.current && !isLoadingPersistence}
            />
            {!isLetterEmpty && (
              <>
                <Separator />
                <TemplateSelector />
                <PdfExportButton 
                  letterContent={currentLetterText} 
                  fileName={`${userInputData?.letterType?.replace(/\s+/g, "-") || "letter"}-draft.pdf`}
                />
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
