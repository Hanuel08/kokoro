import { Chat } from "../components/Chat.jsx"
import { Avatar } from "../components/Avatar.jsx"
import { Header } from "../components/Header.jsx"

export function Main() {
  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      <Header />

      <main className="flex-1 flex w-full max-w-6xl mx-auto relative z-0">

        <div className="flex flex-col w-full md:w-2/3 lg:w-3/4 p-4 z-10">
          <Chat />
        </div>

        {/* Avatar Area - Responsive positioning (side on desktop, background on mobile) */}
        {/* <div className="absolute inset-0 z-[-1] opacity-30 md:opacity-100 md:relative md:z-0 md:w-1/3 lg:w-1/4 pointer-events-none flex items-end md:items-center justify-center pb-10 md:pb-0">
          <Avatar />
        </div> */}

        {/* <div className="absolute w-50 inset-0 z-[-1] opacity-30 md:opacity-100 md:relative md:z-0 md:w-1/3 lg:w-1/4 pointer-events-none flex items-end md:items-center 
          justify-center pb-10 md:pb-0">

          <Avatar />
        </div> */}


        {/* <div className="absolute right-0 bottom-0 w-[400px] h-[800px] pointer-events-none z-0 border-amber-500 border-4">
          <Avatar />
        </div> */}

        <div className="absolute right-0 bottom-0 w-[400px] h-[800px] pointer-events-none z-0">
          <Avatar />
        </div>


      </main>
    </div>
  )
}
