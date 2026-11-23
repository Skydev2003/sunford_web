import { redirect } from "next/navigation";
import { sunford } from "@/features/home/data/brand";

export function GET() {
  redirect(sunford.downloads);
}
