"use client";

import { useState } from "react";
import { ArrowLeft, Save, Bot, Hash, User, Mail } from "lucide-react";
import { useStore } from "@/hooks/useStore";

export default function SettingsPage() {
  const { discordConfig, setDiscordConfig } = useStore();
  const [saved, setSaved] = useState(false);
  const [botToken, setBotToken] = useState(discordConfig.botToken);
  const [channelId, setChannelId] = useState(discordConfig.channelId);
  const [applicantName, setApplicantName] = useState(
    discordConfig.applicantName
  );
  const [applicantEmail, setApplicantEmail] = useState(
    discordConfig.applicantEmail
  );

  const handleSave = () => {
    setDiscordConfig({ botToken, channelId, applicantName, applicantEmail });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <a
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Research
      </a>

      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="space-y-6">
        {/* Discord Configuration */}
        <div className="rounded-xl border border-[var(--border)] p-5 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Bot className="w-5 h-5 text-[var(--primary)]" />
            Discord Integration
          </h2>

          <p className="text-sm text-[var(--muted)]">
            Configure Discord to automatically send research reports after
            generation.
          </p>

          <div className="space-y-3">
            <InputField
              icon={<Bot className="w-4 h-4" />}
              label="Discord Bot Token"
              value={botToken}
              onChange={setBotToken}
              placeholder="Enter your Discord bot token"
              type="password"
            />
            <InputField
              icon={<Hash className="w-4 h-4" />}
              label="Discord Channel ID"
              value={channelId}
              onChange={setChannelId}
              placeholder="Enter channel ID"
            />
            <InputField
              icon={<User className="w-4 h-4" />}
              label="Applicant Name"
              value={applicantName}
              onChange={setApplicantName}
              placeholder="Your name"
            />
            <InputField
              icon={<Mail className="w-4 h-4" />}
              label="Applicant Email"
              value={applicantEmail}
              onChange={setApplicantEmail}
              placeholder="your@email.com"
              type="email"
            />
          </div>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] text-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            {saved ? "Saved!" : "Save Configuration"}
          </button>
        </div>
      </div>
    </div>
  );
}

function InputField({
  icon,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-medium mb-1.5">
        {icon}
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--secondary)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-colors"
      />
    </div>
  );
}
