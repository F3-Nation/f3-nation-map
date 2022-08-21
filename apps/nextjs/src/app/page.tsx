import { redirect } from "next/navigation";

export default async function HomePage() {
  // You can await this here if you don't want to show Suspense fallback below
  redirect("/map");
}
