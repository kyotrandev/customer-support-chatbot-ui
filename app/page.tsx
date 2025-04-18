import { auth } from '@/lib/auth';
import HeaderHome from '@/components/Homepage/Header';
import NavBarHome from '@/components/Homepage/Navbar';
import ChatButton from '@/components/chat/chat-button';

export default async function Home() {
  const session = await auth();
  
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-indigo-950 text-white">
      {/* Navbar */}
      <NavBarHome session={session} />
      
      {/* Hero Section */}
      <div className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-500/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/4" />
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-purple-500/10 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/4" />
        </div>
        
        {/* Hero content */}
        <HeaderHome session={session} />
        
        {/* Chat Button with Dialog */}
        <ChatButton />
      </div>
    </main>
  );
}