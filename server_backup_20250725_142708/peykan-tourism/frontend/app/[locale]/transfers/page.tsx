"use client";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";

export default function TransfersPage() {
  const router = useRouter();
  const t = useTranslations("transfers");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="bg-white rounded-lg shadow-lg p-12 flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-6 text-blue-700">{t("title", { defaultValue: "رزرو ترانسفر" })}</h1>
        <p className="text-lg text-gray-600 mb-8 text-center max-w-md">
          {t("bookingDescription", { defaultValue: "برای رزرو ترانسفر فرودگاهی یا شهری، روی دکمه زیر کلیک کنید و مراحل را تکمیل نمایید." })}
        </p>
        <button
          onClick={() => router.push("/transfers/booking")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold flex items-center gap-2 shadow-md transition-colors"
        >
          {t("startBooking", { defaultValue: "شروع رزرو ترانسفر" })}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
} 