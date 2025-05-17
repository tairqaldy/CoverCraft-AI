
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
  const { user, loading: authLoading } = useAuth();
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
      if (!uid) return;
      setIsLoadingPersistence(true);
      try {
        await saveUserLetter(uid, inputData, letterText);
        // Optional: Show a subtle saving indicator or toast
      } catch (error) {
        console.error("Error saving letter:", error);
        toast({
          variant: "destructive",
          title: "Save Failed",
          description: "Could not save your letter. Please try again.",
        });
      } finally {
        setIsLoadingPersistence(false);
      }
    }, 1500), // 1.5 seconds debounce
  [toast]);

  // Effect for redirecting and loading initial data
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/auth");
    } else if (user && !hasLoadedFromFirestore.current) {
      setIsLoadingPersistence(true);
      getUserLetter(user.uid)
        .then((savedData) => {
          if (savedData) {
            setUserInputData(savedData.userInputData);
            setCurrentLetterText(savedData.currentLetterText);
            toast({ title: "Draft Loaded", description: "Your previously saved draft has been loaded."});
          }
        })
        .catch((error) => {
          console.error("Error loading letter:", error);
          toast({
            variant: "destructive",
            title: "Load Failed",
            description: "Could not load your saved letter.",
          });
        })
        .finally(() => {
          setIsLoadingPersistence(false);
          hasLoadedFromFirestore.current = true;
        });
    }
  }, [user, authLoading, router, toast]);


  // Effect for auto-saving when relevant state changes
  useEffect(() => {
    if (user && hasLoadedFromFirestore.current) { // Only save after initial load and if user is present
      debouncedSave(user.uid, userInputData, currentLetterText);
    }
  }, [userInputData, currentLetterText, user, debouncedSave]);


  const handleGenerateDraft = async (data: InformationFormValues) => {
    if (!user) return;
    setIsLoadingDraft(true);
    setAiSuggestions([]); 
    setUserInputData(data); 
    try {
      const result: GenerateLetterDraftOutput = await generateLetterDraft(data);
      setCurrentLetterText(result.draft); // This will trigger auto-save via useEffect
      toast({
        title: "Draft Generated!",
        description: "Your letter draft has been successfully generated and saved.",
      });
    } catch (error) {
      console.error("Error generating draft:", error);
      toast({
        variant: "destructive",
        title: "Error Generating Draft",
        description: "Something went wrong. Please try again.",
      });
      setCurrentLetterText(''); 
    } finally {
      setIsLoadingDraft(false);
    }
  };

  const handleImproveContent = async () => {
    if (!user || !currentLetterText.trim() || !userInputData) {
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
      setCurrentLetterText(result.improvedContent); // This will trigger auto-save
      setAiSuggestions(result.suggestions);
      toast({
        title: "Content Improved!",
        description: "AI has refined your letter, and changes are saved.",
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
    setCurrentLetterText(content); // This will trigger auto-save
    if (aiSuggestions.length > 0) {
        setAiSuggestions([]);
    }
  };
  
  const isLetterEmpty = !currentLetterText.trim();
  const globalLoading = authLoading || isLoadingPersistence;

  if (globalLoading && !hasLoadedFromFirestore.current) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading your CoverCraft experience...</p>
      </div>
    );
  }
  
  if (!user) { // Should be caught by redirect, but as a fallback
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
        { (isLoadingDraft || isLoadingImprovement || isLoadingPersistence) && hasLoadedFromFirestore.current && (
            <div className="fixed top-20 right-8 z-50_ flex items-center space-x-2 rounded-md bg-primary/10 p-2 text-sm text-primary backdrop-blur-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
            </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="lg:sticky lg:top-8">
            <InformationInputForm 
              onSubmit={handleGenerateDraft} 
              isLoading={isLoadingDraft}
              initialValues={userInputData || undefined} // Pass loaded data to form
            />
          </div>
          <div className="space-y-8">
            <LetterDisplay
              letterContent={currentLetterText}
              onLetterContentChange={handleLetterContentChange}
              onImproveContent={handleImproveContent}
              aiSuggestions={aiSuggestions}
              isLoading={isLoadingDraft || isLoadingImprovement} 
              isInitiallyEmpty={!userInputData && !currentLetterText && hasLoadedFromFirestore.current} // Check after attempting to load
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

