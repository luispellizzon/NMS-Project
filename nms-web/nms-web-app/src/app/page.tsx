import Link from 'next/link';
import Image from 'next/image';
import { BrainCircuit, LogIn } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 p-4 sm:px-6 lg:px-8">
        <nav className="container mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <BrainCircuit className="h-7 w-7 text-[#0d7377]" />
            <span className="hidden sm:inline">NeuroMind System</span>
          </Link>
          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/signin"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground hover:text-[#0d7377] transition-colors"
            >
              <LogIn className="h-4 w-4" />
              Login
            </Link>
            <Link
              href="/signup"
              className="px-5 py-2 text-sm font-semibold text-white bg-[#0d7377] rounded-full shadow-md hover:bg-[#0a5c5f] transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0d7377]"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen pt-20 pb-10 lg:pt-0 lg:pb-0">
          {/* Left Column: Text Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
              Empowering Early <br />
              <span className="text-[#0d7377]">Dementia Detection</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
              A secure, AI-powered platform for healthcare professionals to monitor, analyze, and manage patient dementia risk profiles with confidence and precision.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                href="/signup"
                className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-white bg-[#0d7377] rounded-lg shadow-lg hover:bg-[#0a5c5f] transition-transform hover:scale-105"
              >
                Create an Account
              </Link>
              <Link
                href="/signin"
                className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-foreground bg-muted rounded-lg hover:bg-border transition-colors"
              >
                Sign In to Dashboard
              </Link>
            </div>
          </div>

          {/* Right Column: Illustration */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative w-full max-w-lg aspect-square">
              <Image
                src="/images/hospital-illustration.png"
                alt="Illustration of a hospital with doctors"
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}