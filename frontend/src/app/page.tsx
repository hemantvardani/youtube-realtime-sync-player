
import { io } from "socket.io-client";
import HomePage from "@/ui/components/HomePage";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans">
      <div>
        <HomePage/>
      </div>
    </div>
  );
}
