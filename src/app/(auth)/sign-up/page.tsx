"use client";

import React, {
  useState,
  type FC,
  type ComponentProps,
  useTransition,
} from "react";

import { signUp, oAuthSignIn } from "@/actions/auth"; // [MODIFIED] Import server actions
import { OAuthProvider } from "@/generated/prisma"; // [MODIFIED] Import enum for type safety
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  Shield,
  Users,
  Zap,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

const Icons = {
  google: (props: ComponentProps<"svg">) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
      />
    </svg>
  ),
  gitHub: (props: ComponentProps<"svg">) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z"
      />
    </svg>
  ),
  discord: (props: ComponentProps<"svg">) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"
      />
    </svg>
  ),
};

type SVGProps = ComponentProps<"svg">;
type IconType = FC<SVGProps>;

// --- Reusable Components ---

const AnimatedBackground: FC = () => (
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-brand-gradient-start/20 to-brand-gradient-end/20 rounded-full blur-3xl animate-pulse"></div>
    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-feature-1-start/20 to-feature-1-end/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-feature-2-start/10 to-feature-2-end/10 rounded-full blur-3xl animate-pulse delay-500"></div>
  </div>
);

const Logo: FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <div className="w-12 h-12 bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end rounded-xl flex items-center justify-center">
      <Sparkles className="w-6 h-6 text-white" />
    </div>
    <h1 className="text-3xl font-bold bg-gradient-to-r from-text-strong to-brand bg-clip-text text-transparent">
      Siquiz
    </h1>
  </div>
);

const OAuthButton: FC<{
  provider: string;
  icon: IconType;
  onClick: () => void;
  isPending?: boolean;
  hoverColorClass: string;
}> = ({
  provider,
  icon: Icon,
  onClick,
  isPending = false,
  hoverColorClass,
}) => (
  <button
    onClick={onClick}
    disabled={isPending}
    className={`group flex items-center justify-center w-14 h-14 rounded-full border border-border/50 bg-surface-raised/50 ${hoverColorClass} transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
    aria-label={`Continue with ${provider}`}
  >
    <Icon className="w-6 h-6 text-text-subtle group-hover:text-white transition-colors duration-200" />
  </button>
);

const FormInput: FC<{
  label: string;
  type?: "text" | "email" | "password";
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  icon: IconType;
  required?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
}> = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  icon: Icon,
  required = false,
  showPassword,
  onTogglePassword,
}) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-text-strong">{label}</label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-subtle" />
      <input
        type={type === "password" && showPassword ? "text" : type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full pl-10 pr-12 py-3 rounded-xl border border-border/50 bg-surface-raised/50 focus:bg-surface-raised focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all duration-200 text-text-strong placeholder-text-subtle"
        placeholder={placeholder}
        required={required}
      />
      {type === "password" && onTogglePassword && (
        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-subtle hover:text-text-strong transition-colors"
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      )}
    </div>
  </div>
);

const FeatureCard: FC<{
  icon: IconType;
  title: string;
  description: string;
  gradientFrom: string;
  gradientTo: string;
}> = ({ icon: Icon, title, description, gradientFrom, gradientTo }) => (
  <div className="flex items-start gap-4 p-4 rounded-2xl bg-surface-raised/50 backdrop-blur-sm border border-border/50 hover:bg-surface-raised/80 transition-all duration-300 hover:transform hover:scale-105">
    <div
      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradientFrom} ${gradientTo} flex items-center justify-center flex-shrink-0`}
    >
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div>
      <h3 className="font-semibold text-text-strong mb-1">{title}</h3>
      <p className="text-text-subtle text-sm">{description}</p>
    </div>
  </div>
);

// [NEW] Alert Component for displaying feedback
const FormAlert: FC<{ type: "error" | "success"; message: string }> = ({
  type,
  message,
}) => {
  if (!message) return null;

  const isError = type === "error";
  const bgColor = isError ? "bg-red-500/10" : "bg-green-500/10";
  const borderColor = isError ? "border-red-500/50" : "border-green-500/50";
  const textColor = isError ? "text-red-400" : "text-green-400";
  const Icon = isError ? AlertCircle : CheckCircle2;

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border ${bgColor} ${borderColor} ${textColor}`}
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <p className="text-sm">{message}</p>
    </div>
  );
};

// --- Main Page Component ---
const SignUpPage: FC = () => {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | undefined>("");
  const [message, setMessage] = useState<string | undefined>("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (formData.password !== formData.confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok.");
      return;
    }

    startTransition(async () => {
      const result = await signUp({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      if ((result as { error?: string })?.error) {
        setError((result as { error?: string })?.error);
      } else {
        if (
          typeof result === "object" &&
          result !== null &&
          "message" in result
        ) {
          setMessage(result.message);
        } else if (typeof result === "string") {
          setMessage(result);
        } else {
          setMessage("Account created successfully.");
        }
        // Optionally clear the form
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
      }
    });
  };

  const handleOAuthSignIn = (provider: OAuthProvider) => {
    startTransition(async () => {
      await oAuthSignIn(provider);
    });
  };

  const oauthProviders = [
    {
      name: "Google",
      provider: OAuthProvider.google,
      icon: Icons.google,
      hoverColorClass: "hover:bg-[#4285F4]",
    },
    {
      name: "GitHub",
      provider: OAuthProvider.github,
      icon: Icons.gitHub,
      hoverColorClass: "hover:bg-[#181717]",
    },
    {
      name: "Discord",
      provider: OAuthProvider.discord,
      icon: Icons.discord,
      hoverColorClass: "hover:bg-[#5865F2]",
    },
  ];

  const features = [
    {
      icon: Shield,
      title: "Dirancang Aman",
      description: "Data Anda dilindungi dengan standar keamanan tertinggi.",
      gradientFrom: "from-feature-1-start",
      gradientTo: "to-feature-1-end",
    },
    {
      icon: Users,
      title: "Belajar Kolaboratif",
      description:
        "Bergabunglah dengan komunitas pembelajar dan berkembang bersama.",
      gradientFrom: "from-feature-2-start",
      gradientTo: "to-feature-2-end",
    },
    {
      icon: Zap,
      title: "Akses Instan",
      description:
        "Mulai dalam hitungan detik dan akses konten secara langsung.",
      gradientFrom: "from-feature-3-start",
      gradientTo: "to-feature-3-end",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-page-gradient-start via-page-gradient-middle to-page-gradient-end relative overflow-hidden">
      <AnimatedBackground />
      <div className="relative z-10 flex min-h-screen">
        {/* Panel Kiri */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-2/5 flex-col justify-center p-12 bg-gradient-to-br from-surface-raised/80 to-surface-raised/60 backdrop-blur-sm">
          <div className="max-w-md mx-auto">
            <div className="mb-8">
              <Logo className="mb-6" />
              <h2 className="text-4xl font-bold text-text-strong mb-4 leading-tight">
                Buka Potensi
                <span className="block bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end bg-clip-text text-transparent">
                  Penuh Anda
                </span>
              </h2>
              <p className="text-text-subtle text-lg leading-relaxed">
                Bergabunglah dengan ribuan pembelajar dan mulai perjalanan Anda
                dengan alat bertenaga AI yang dirancang untuk membantu Anda
                sukses.
              </p>
            </div>
            <div className="space-y-6">
              {features.map((feature, index) => (
                <FeatureCard key={index} {...feature} />
              ))}
            </div>
          </div>
        </div>

        {/* Panel Kanan (Formulir) */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-md">
            <div className="bg-surface-raised/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-border/50 p-8 transform transition-all duration-300 hover:shadow-3xl">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-text-strong mb-2">
                  Buat Akun Anda
                </h1>
                <p className="text-text-subtle">
                  Mulai petualangan belajar Anda bersama Siquiz
                </p>
              </div>

              <div className="flex items-center justify-center gap-4 mb-6">
                {oauthProviders.map((provider) => (
                  <OAuthButton
                    key={provider.name}
                    provider={provider.name}
                    icon={provider.icon}
                    onClick={() => handleOAuthSignIn(provider.provider)}
                    isPending={isPending}
                    hoverColorClass={provider.hoverColorClass}
                  />
                ))}
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-border"></div>
                <span className="text-text-subtle text-sm">
                  atau daftar dengan email
                </span>
                <div className="flex-1 h-px bg-border"></div>
              </div>

              <div className="space-y-4">
                <FormAlert type="error" message={error || ""} />
                <FormAlert type="success" message={message || ""} />

                <FormInput
                  label="Nama Lengkap"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Masukkan nama lengkap Anda"
                  icon={User}
                  required
                />
                <FormInput
                  label="Alamat Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Masukkan alamat email Anda"
                  icon={Mail}
                  required
                />
                <FormInput
                  label="Kata Sandi"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Buat kata sandi yang kuat"
                  icon={Lock}
                  required
                  showPassword={showPassword}
                  onTogglePassword={() => setShowPassword(!showPassword)}
                />
                <FormInput
                  label="Konfirmasi Kata Sandi"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Konfirmasi kata sandi Anda"
                  icon={Lock}
                  required
                  showPassword={showConfirmPassword}
                  onTogglePassword={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                />
                <button
                  onClick={handleSubmit}
                  disabled={isPending}
                  className="w-full bg-gradient-to-r from-cta-gradient-start via-cta-gradient-middle to-cta-gradient-end text-white font-semibold py-3 px-4 rounded-xl hover:shadow-lg hover:shadow-brand/25 transition-all duration-300 hover:transform hover:scale-105 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Membuat Akun...
                    </>
                  ) : (
                    <>
                      Daftar
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>

              <div className="mt-8 text-center">
                <p className="text-text-subtle">
                  Sudah punya akun?{" "}
                  <Link
                    href="/sign-in"
                    className="text-brand hover:text-brand-gradient-end font-semibold transition-colors"
                  >
                    Masuk
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
