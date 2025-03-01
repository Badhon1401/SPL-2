// app/home/layout.js (or whatever your path is)
import Navbar from "@/components/Navbar";
import SidebarLeft from "@/components/SidebarLeft";
import SidebarRight from "@/components/SidebarRight";

export default async function HomeLayout({ children }) {
  return (
    <div
      className="flex flex-col h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black 
                 dark:bg-gray-900 dark:bg-opacity-90 transition-all duration-500"
    >
      <Navbar />
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar */}
        <SidebarLeft />

        {/* Main Content */}
        <main
          className="flex-1 overflow-y-auto p-6 md:ml-24 md:mr-24 lg:ml-48 lg:mr-48 
                     backdrop-blur-xl bg-opacity-70 shadow-lg"
        >
          {children}
        </main>

        {/* Right Sidebar (Commented Out for Now) */}
        {/* <SidebarRight /> */}

        {/* Soft Neon Glow Effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full bg-gradient-to-br from-transparent via-indigo-900 to-transparent opacity-30 blur-3xl"></div>
        </div>
      </div>
    </div>
  );
}
