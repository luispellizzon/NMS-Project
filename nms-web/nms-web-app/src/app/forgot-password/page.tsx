// src/app/forgot-password/page.tsx

import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import SignUpIllustration from '@/components/auth/SignUpIllustration';

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen">
      <div className="flex flex-1 flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <ForgotPasswordForm />
        </div>
      </div>
      <div className="relative hidden w-0 flex-1 lg:block bg-[#e0f2f1]">
        <SignUpIllustration />
      </div>
    </div>
  );
}