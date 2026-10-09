import { notFound } from "next/navigation";
import { FitClient } from "./FitClient";

export const metadata = {
  title: "Căn chỉnh trang phục (Nội bộ) | Việt Phục Remix",
  robots: {
    index: false,
    follow: false,
  },
};

export default function FitPage() {
  const isEnabled =
    process.env.ENABLE_FIT === "1" ||
    process.env.NEXT_PUBLIC_ENABLE_FIT === "1";

  if (!isEnabled) {
    notFound();
  }

  return <FitClient />;
}
