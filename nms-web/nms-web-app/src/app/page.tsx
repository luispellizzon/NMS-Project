import Link from "next/link";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-4xl font-bold mb-6">Welcome to the NeuroMind System</h1>
        <Link href="/signin" className="px-4 py-2 text-lg font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">
          Sign In
        </Link>
      </main>
    </div>
  );
}
