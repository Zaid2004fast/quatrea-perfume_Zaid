import { Journey } from "@/components/home/Journey";
import { Epilogue } from "@/components/home/Epilogue";
import { Footer } from "@/components/shell/Footer";

export default function Home() {
  return (
    <main className="page">
      <Journey />
      <Epilogue />
      <Footer />
    </main>
  );
}
