"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LayoutGrid } from "lucide-react";
import Image from "next/image";

export function TemplateSelector() {
  const { toast } = useToast();

  const handleSelectTemplate = (templateName: string) => {
    toast({
      title: "Template Selected (Mock)",
      description: `You selected the "${templateName}" template. Actual template application is not yet implemented.`,
    });
  };

  const templates = [
    { name: "Classic Professional", Aihint: "document resume" },
    { name: "Modern Minimalist", Aihint: "minimalist design" },
    { name: "Creative Portfolio", Aihint: "portfolio layout" },
  ];

  return (
    <Card className="shadow-lg mt-6">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
            <LayoutGrid className="mr-2 h-5 w-5" />
            Choose a Template
        </CardTitle>
        <CardDescription>Select a style for your letter (feature is mocked).</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Button
            key={template.name}
            variant="outline"
            className="h-auto p-0 flex flex-col items-center justify-center group hover:bg-accent/10"
            onClick={() => handleSelectTemplate(template.name)}
          >
            <Image 
              src={`https://placehold.co/200x280.png`}
              alt={`${template.name} template preview`}
              data-ai-hint={template.Aihint}
              width={200}
              height={280}
              className="rounded-t-md w-full object-cover"
            />
            <span className="py-3 text-sm font-medium text-foreground group-hover:text-accent-foreground">
              {template.name}
            </span>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
