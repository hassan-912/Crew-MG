import { Metadata } from "next";
import SchengenDashboard from "./SchengenDashboard";

export const metadata: Metadata = {
  title: "Schengen Visa Training | Crew-MG",
  description:
    "Comprehensive Schengen visa training portal covering general basics and country-specific guides for Spain, Germany, France, Netherlands, and Italy.",
};

export default function TrainingPage() {
  return <SchengenDashboard />;
}
