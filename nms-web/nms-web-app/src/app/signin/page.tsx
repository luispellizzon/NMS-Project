// app/signin/page.tsx
import SignInForm from '@/components/auth/SignInForm';
import Image from 'next/image';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <SignInForm />
      </div>

      {/* Right side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0d7377] items-center justify-center rounded-l-4xl p-12">
        <div className="relative w-full max-w-md aspect-square">
          <Image
            src="/images/hospital-illustration.png"
            alt="Hospital and NMS branding"
            fill
            className="object-contain"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </div>
      </div>
    </div>
  );
}