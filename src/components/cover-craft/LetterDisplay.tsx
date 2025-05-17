"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Brain, Loader2, ThumbsUp } from "lucide-react";

interface LetterDisplayProps {
  letterContent: string;
  onLetterContentChange: (content: string) => void;
  onImproveContent: () => Promise<void>;
  aiSuggestions: string[];
  isLoading: boolean;
  isInitiallyEmpty: boolean;
}

export function LetterDisplay({
  letterContent,
  onLetterContentChange,
  onImproveContent,
  aiSuggestions,
  isLoading,
  isInitiallyEmpty,
}: LetterDisplayProps) {
  const [editedContent, setEditedContent] = useState(letterContent);

  useEffect(() => {
    setEditedContent(letterContent);
  }, [letterContent]);

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedContent(event.target.value);
    onLetterContentChange(event.target.value);
  };

  if (isInitiallyEmpty && !letterContent) {
    return (
       <Card className="shadow-lg h-full flex flex-col items-center justify-center">
        <CardHeader className="text-center">
          <img src="https://placehold.co/300x200.png" alt="Empty state placeholder" data-ai-hint="writer document" className="mx-auto mb-4 rounded-md" />
          <CardTitle className="text-2xl">Your Letter Appears Here</CardTitle>
          <CardDescription>
            Fill out the form on the left and click "Generate Draft" to get started.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Your Draft</CardTitle>
          <CardDescription>
            Review and edit your letter. Use our AI to further refine it.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={editedContent}
            onChange={handleTextChange}
            placeholder="Your generated letter will appear here..."
            className="min-h-[300px] resize-y text-base"
            disabled={isLoading}
          />
          <Button onClick={onImproveContent} className="w-full" disabled={isLoading || !editedContent.trim()}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Brain className="mr-2 h-4 w-4" />
            )}
            Improve Content with AI
          </Button>
        </CardContent>
      </Card>

      {aiSuggestions.length > 0 && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <ThumbsUp className="mr-2 h-5 w-5 text-accent" />
              AI Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="default" className="bg-accent/10 border-accent/30">
              <AlertDescription>
                <ul className="list-disc space-y-1 pl-5">
                  {aiSuggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
