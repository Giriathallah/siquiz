"use client";

import { useState } from "react";
import {
  Brain,
  Users,
  Zap,
  Target,
  Star,
  ArrowRight,
  Play,
  BookOpen,
  Award,
  Sparkles,
  TrendingUp,
  Globe,
} from "lucide-react";
import { ThemeToggle } from "@/components/user/toggleTheme";
import Link from "next/link";

export default function HomePage() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Pembuatan Kuis Berbasis AI",
      description:
        "Hasilkan kuis cerdas secara instan dengan teknologi AI canggih kami.",
      color: "from-feature-1-start to-feature-1-end",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Pembelajaran Kolaboratif",
      description:
        "Berbagi, selesaikan, dan belajar bersama dengan komunitas yang dinamis.",
      color: "from-feature-2-start to-feature-2-end",
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Pengalaman Terpersonalisasi",
      description:
        "Alur belajar adaptif yang disesuaikan dengan kemajuan dan minat Anda.",
      color: "from-feature-3-start to-feature-3-end",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Hasil Instan",
      description:
        "Dapatkan umpan balik langsung dan analitik terperinci tentang performa Anda.",
      color: "from-feature-4-start to-feature-4-end",
    },
  ];

  const stats = [
    {
      number: "10rb+",
      label: "Pengguna Aktif",
      icon: <Users className="w-5 h-5" />,
    },
    {
      number: "50rb+",
      label: "Kuis Dibuat",
      icon: <BookOpen className="w-5 h-5" />,
    },
    {
      number: "1jt+",
      label: "Soal Terjawab",
      icon: <Award className="w-5 h-5" />,
    },
    {
      number: "95%",
      label: "Kepuasan Pengguna",
      icon: <Star className="w-5 h-5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-page-gradient-start via-page-gradient-middle to-page-gradient-end">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-surface-raised/80 dark:bg-background/80 border-b border-border/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-brand-foreground" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-brand to-brand-gradient-end bg-clip-text text-transparent">
                Siquiz
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <Link
                href={"/sign-in"}
                className="px-4 py-2 text-text-subtle hover:text-brand font-medium transition-colors"
              >
                Masuk
              </Link>
              <Link
                href={"/sign-up"}
                className="px-6 py-2 bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end text-brand-foreground font-semibold rounded-xl hover:shadow-lg hover:shadow-[oklch(var(--brand-gradient-start)_/_0.25)] transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Mulai
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-[oklch(var(--cta-gradient-start)_/_0.1)] via-[oklch(var(--cta-gradient-middle)_/_0.1)] to-[oklch(var(--cta-gradient-end)_/_0.1)]"></div>
        <div className="container mx-auto px-6 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center px-4 py-2 bg-brand-subtle rounded-full text-brand text-sm font-medium">
                <Sparkles className="w-4 h-4 mr-2" />
                Platform Belajar Berbasis AI
              </div>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold text-text-strong mb-6 leading-tight">
              Belajar Lebih Cerdas dengan
              <span className="block bg-gradient-to-r from-cta-gradient-start via-cta-gradient-middle to-cta-gradient-end bg-clip-text text-transparent">
                Kuis Interaktif
              </span>
            </h1>

            <p className="text-xl text-text-subtle mb-10 max-w-2xl mx-auto leading-relaxed">
              Buat, bagikan, dan selesaikan kuis dengan kekuatan AI.
              Bergabunglah dengan ribuan pelajar dalam membangun pengetahuan
              bersama.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button className="group px-8 py-4 bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end text-brand-foreground font-semibold rounded-2xl hover:shadow-2xl hover:shadow-[oklch(var(--brand-gradient-start)_/_0.25)] transition-all duration-300 transform hover:-translate-y-1 flex items-center">
                Mulai Buat Kuis
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="group px-8 py-4 bg-surface-raised text-foreground font-semibold rounded-2xl border-2 border-border hover:border-ring hover:shadow-lg transition-all duration-300 flex items-center">
                <Play className="mr-2 w-5 h-5" />
                Tonton Demo
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-3xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="flex justify-center mb-2">
                    <div className="p-3 bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end rounded-xl text-brand-foreground group-hover:scale-110 transition-transform">
                      {stat.icon}
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-text-strong mb-1">
                    {stat.number}
                  </div>
                  <div className="text-sm text-text-subtle">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-surface-raised">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-text-strong mb-4">
              Fitur Unggulan untuk Pembelajaran Modern
            </h2>
            <p className="text-xl text-text-subtle max-w-3xl mx-auto">
              Rasakan masa depan pembelajaran interaktif dengan platform
              mutakhir kami yang dirancang untuk pengajar dan siswa.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative p-8 bg-gradient-to-br from-surface-raised to-page-gradient-start rounded-3xl border border-border hover:border-transparent hover:shadow-2xl hover:shadow-[oklch(var(--border)_/_0.5)] transition-all duration-500 cursor-pointer"
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-500`}
                ></div>

                <div className="relative">
                  <div
                    className={`inline-flex p-4 bg-gradient-to-br ${feature.color} rounded-2xl text-brand-foreground mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    {feature.icon}
                  </div>

                  <h3 className="text-2xl font-bold text-text-strong mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-text-subtle text-lg leading-relaxed">
                    {feature.description}
                  </p>

                  <div className="mt-6 flex items-center text-brand font-semibold group-hover:translate-x-2 transition-transform duration-300">
                    Pelajari Lebih Lanjut
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-cta-gradient-start via-cta-gradient-middle to-cta-gradient-end relative overflow-hidden">
        <div className="absolute inset-0 bg-[oklch(0_0_0_/_0.15)] dark:bg-[oklch(0_0_0_/_0.2)]"></div>
        <div className="container mx-auto px-6 relative">
          <div className="text-center max-w-3xl mx-auto text-brand-foreground">
            <TrendingUp className="w-16 h-16 mx-auto mb-6 opacity-90" />
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Siap Mengubah Cara Belajar Anda?
            </h2>
            <p className="text-xl mb-10 opacity-90">
              Bergabunglah dengan ribuan pelajar yang sudah merasakan masa depan
              pendidikan bersama Siquiz.
            </p>
            <button className="px-10 py-4 bg-surface-raised text-text-strong font-bold rounded-2xl hover:shadow-2xl hover:shadow-[oklch(var(--brand-foreground)_/_0.25)] transition-all duration-300 transform hover:-translate-y-1 inline-flex items-center">
              Mulai Perjalanan Anda
              <Globe className="ml-3 w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card text-brand py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-6 lg:mb-0">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-brand" />
              </div>
              <span className="text-2xl font-bold">Siquiz</span>
            </div>

            <div className="text-center lg:text-right">
              <p className="text-muted-foreground mb-2">
                © 2025 Siquiz. Hak cipta dilindungi undang-undang.
              </p>
              <p className="text-[oklch(var(--muted-foreground)_/_0.8)] text-sm">
                Memberdayakan pikiran melalui pembelajaran interaktif
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
