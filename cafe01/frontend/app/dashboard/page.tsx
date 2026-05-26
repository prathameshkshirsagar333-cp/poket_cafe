import Navbar from "../components/Navbar";
import DashboardSection from "../components/DashboardSection";
import Footer from "../components/Footer";

export default function DashboardPage() {
  return (
    <>
      <Navbar />
      <main className="flex flex-col flex-1 w-full mx-auto justify-center bg-background min-h-[70vh]">
        <DashboardSection />
      </main>
      <Footer />
    </>
  );
}
