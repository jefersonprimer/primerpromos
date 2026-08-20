"use client";

import { useRouter } from "next/navigation";
import Header from "./Header";

export default function ProductHeader() {
  const router = useRouter();

  const handleCategoryChange = (category: string | null) => {
    if (category) {
      router.push(`/?category=${encodeURIComponent(category)}`);
    } else {
      router.push("/");
    }
  };

  return (
    <Header />
  );
}
