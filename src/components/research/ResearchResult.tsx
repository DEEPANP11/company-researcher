"use client";

import { Building2, Globe, MapPin, Phone, Package, Wrench, AlertTriangle, TrendingUp, FileText } from "lucide-react";
import { PdfDownloadButton } from "./PdfDownloadButton";
import type { ResearchResult } from "@/types";

export function ResearchResult({ result }: { result: ResearchResult }) {
  const { company, competitors } = result;

  return (
    <div className="mt-3 space-y-4 animate-fade-in">
      {/* Company Header */}
      <div>
        <h3 className="font-semibold text-base flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          {company.name}
        </h3>
        {company.summary && (
          <p className="text-sm mt-1 opacity-80">{company.summary}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        {company.website && (
          <InfoRow icon={<Globe className="w-3.5 h-3.5" />} label="Website" value={company.website} />
        )}
        {company.phone && (
          <InfoRow icon={<Phone className="w-3.5 h-3.5" />} label="Phone" value={company.phone} />
        )}
        {company.address && (
          <InfoRow icon={<MapPin className="w-3.5 h-3.5" />} label="Address" value={company.address} />
        )}
        {company.industry && (
          <InfoRow icon={<TrendingUp className="w-3.5 h-3.5" />} label="Industry" value={company.industry} />
        )}
      </div>

      {/* Products */}
      {company.products.length > 0 && (
        <Section icon={<Package className="w-4 h-4" />} title="Products">
          <div className="flex flex-wrap gap-1.5 mt-1">
            {company.products.map((p, i) => (
              <span key={i} className="px-2 py-0.5 text-xs rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
                {p}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Services */}
      {company.services.length > 0 && (
        <Section icon={<Wrench className="w-4 h-4" />} title="Services">
          <div className="flex flex-wrap gap-1.5 mt-1">
            {company.services.map((s, i) => (
              <span key={i} className="px-2 py-0.5 text-xs rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
                {s}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Pain Points */}
      {company.painPoints.length > 0 && (
        <Section icon={<AlertTriangle className="w-4 h-4" />} title="AI-Generated Pain Points">
          <ul className="mt-1 space-y-1">
            {company.painPoints.map((p, i) => (
              <li key={i} className="text-xs flex items-start gap-2">
                <span className="text-[var(--destructive)] mt-0.5">•</span>
                {p}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Competitors */}
      {competitors.length > 0 && (
        <Section icon={<TrendingUp className="w-4 h-4" />} title="Competitors">
          <div className="grid grid-cols-2 gap-2 mt-1">
            {competitors.map((c, i) => (
              <div
                key={i}
                className="p-2 rounded-lg border border-[var(--border)] text-xs"
              >
                <div className="font-medium">{c.name}</div>
                <div className="text-[var(--muted)] truncate">{c.website}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <PdfDownloadButton result={result} />
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2 text-xs">
      <span className="text-[var(--muted)] mt-0.5 flex-shrink-0">{icon}</span>
      <div>
        <span className="text-[var(--muted)]">{label}: </span>
        <span>{value}</span>
      </div>
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="text-sm font-medium flex items-center gap-1.5">
        {icon}
        {title}
      </h4>
      {children}
    </div>
  );
}
