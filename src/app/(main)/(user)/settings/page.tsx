import { ScrollArea } from "@radix-ui/react-scroll-area";

export default function SettingsPage() {
  return (
    <main className="w-full h-full flex flex-col items-center justify-center gap-2 relative">
      <div className="absolute inset-0 opacity-25 dark:opacity-35 pointer-events-none">
        <div className="w-full h-full bg-linear-to-br from-red-100 via-pink-50 to-blue-100 dark:from-red-950 dark:via-pink-950 dark:to-blue-950 blur-3xl"></div>
      </div>
      <header className="w-full flex flex-col items-start justify-center border-b-4 p-2">
        <h1 className="text-2xl font-bold mb-4">Settings</h1>
        <p>Manage your account settings here.</p>
      </header>
      <section className="w-full space-y-3 flex-1 flex items-center justify-center p-4 overflow-hidden">
        <ScrollArea className="w-full space-y-4 max-w-xl rounded-md p-4 max-h-[75vh] overflow-y-auto hide-scrollbar">
          <div className="p-4 border rounded-md">setting items list</div>
          <div className="p-4 border rounded-md">setting items list</div>
          <div className="p-4 border rounded-md">setting items list</div>
          <div className="p-4 border rounded-md">setting items list</div>
          <div className="p-4 border rounded-md">setting items list</div>
          <div className="p-4 border rounded-md">setting items list</div>
          <div className="p-4 border rounded-md">setting items list</div>
          <div className="p-4 border rounded-md">setting items list</div>
          <div className="p-4 border rounded-md">setting items list</div>
          <div className="p-4 border rounded-md">setting items list</div>
          <div className="p-4 border rounded-md">setting items list</div>
          <div className="p-4 border rounded-md">setting items list</div>
          <div className="p-4 border rounded-md">setting items list</div>
        </ScrollArea>
      </section>
    </main>
  );
}
