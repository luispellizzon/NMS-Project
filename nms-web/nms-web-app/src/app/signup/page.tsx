// app/signup/page.tsx
import SignUpForm from '@/components/auth/SignUpForm';
import Image from 'next/image';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <SignUpForm />
      </div>

      {/* Right side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0d7377] items-center rounded-l-4xl justify-center p-12">
        <div className="relative w-full max-w-md aspect-square">
          <Image
            src="/images/hospital-illustration.png"
            alt="Hospital and NMS branding"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
    </div>
  );
}