import { FileText } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto flex h-16 items-center justify-start px-4 md:px-8">
        <FileText className="mr-3 h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">CoverCraft AI</h1>
      </div>
    </header>
  );
}
