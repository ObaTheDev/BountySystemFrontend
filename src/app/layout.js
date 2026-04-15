import "./globals.css";

export const metadata = {
  title: "CampusGig - University Micro-Task Platform",
  description: "A perfect platform for students and departments for micro-tasks.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* viewport meta for proper mobile scaling */}
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#2563eb" />
      </head>
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900 flex flex-col overflow-x-hidden">
        <main className="flex-1 w-full max-w-5xl mx-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
