import { useState } from "react";
import {
  HugeiconsIcon,
  Cancel01Icon,
  Maximize02Icon,
  CheckmarkBadge02Icon,
  ChartLineData02Icon,
  AlertCircleIcon,
  FireIcon,
} from "./icons";
import { IconFromKey } from "./icons";
import type { Lead } from "./types";
import { LEADS, getAccountsFromLeads } from "./types";
import { LeadDrawer } from "./LeadDrawer";

interface Props {
  onClose: () => void;
  onTweakInChat: (leadName: string, company: string) => void;
}

type ModalView = "leads" | "accounts";

const STATUS_CONFIG: Record<string, { text: string; iconKey: string; iconColor: string }> = {
  "meeting-booked": { text: "Meeting booked", iconKey: "checkmark", iconColor: "#22c55e" },
  "high-engagement": { text: "High engagement", iconKey: "chart-line", iconColor: "#3b82f6" },
  "opened-no-click": { text: "Opens, no clicks", iconKey: "alert", iconColor: "#f59e0b" },
  "partial-engagement": { text: "Partial engagement", iconKey: "", iconColor: "" },
  "no-engagement": { text: "No engagement", iconKey: "", iconColor: "" },
  "pre-send-upgrade": { text: "Pre-send upgrade", iconKey: "checkmark", iconColor: "#22c55e" },
};

export function LeadsExpandModal({ onClose, onTweakInChat }: Props) {
  const [view, setView] = useState<ModalView>("leads");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const accounts = getAccountsFromLeads();

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-8"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            if (selectedLead) setSelectedLead(null);
            else onClose();
          }
        }}
      >
        {/* Modal */}
        <div
          className="bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{ width: "80vw", height: "80vh" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal header */}
          <div className="px-6 py-4 border-b border-[#e9e9e7] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <p className="text-[15px] text-foreground" style={{ fontWeight: 600 }}>
                Re-engage Stalled Pipeline Deals
              </p>
              <span className="text-[11px] text-[#9b9a97]" style={{ fontWeight: 400 }}>
                34 leads · 28 accounts
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* Leads / Accounts toggle */}
              <div className="flex items-center bg-[#f7f7f5] rounded-lg p-0.5">
                {(["leads", "accounts"] as ModalView[]).map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`px-3 py-1 rounded-md text-[12px] capitalize transition-colors ${
                      view === v
                        ? "bg-white text-foreground shadow-sm"
                        : "text-[#9b9a97] hover:text-foreground/70"
                    }`}
                    style={{ fontWeight: view === v ? 500 : 400 }}
                  >
                    {v}
                  </button>
                ))}
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#9b9a97] hover:text-foreground hover:bg-[#f7f7f5] transition-colors"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={15} />
              </button>
            </div>
          </div>

          {/* Modal content */}
          <div className="flex-1 overflow-hidden relative flex">
            {/* Main table area */}
            <div className="flex-1 overflow-y-auto">
              {view === "leads" ? (
                <table className="w-full">
                  <thead className="sticky top-0 bg-white border-b border-[#e9e9e7]">
                    <tr>
                      {["Lead", "Company", "Role", "Score", "Seg", "Status", "Emails", ""].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-[10px] text-[#9b9a97] uppercase tracking-wider"
                          style={{ fontWeight: 500 }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {LEADS.map((lead) => (
                      <tr
                        key={lead.id}
                        onClick={() => setSelectedLead(lead)}
                        className="border-b border-[#e9e9e7]/60 last:border-0 hover:bg-[#fafaf9] transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-3 text-[13px] text-foreground" style={{ fontWeight: 500 }}>
                          {lead.name}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-[#9b9a97]" style={{ fontWeight: 400 }}>
                          {lead.company}
                        </td>
                        <td className="px-4 py-3 text-[12px] text-[#9b9a97]" style={{ fontWeight: 400 }}>
                          {lead.role}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-foreground" style={{ fontWeight: 500 }}>
                          {lead.score} {lead.scoreLevel === "hot" ? <HugeiconsIcon icon={FireIcon} size={11} color="#ef4444" /> : null}
                        </td>
                        <td className="px-4 py-3 text-[12px] text-[#9b9a97]" style={{ fontWeight: 400 }}>
                          {lead.segment}
                        </td>
                        <td className="px-4 py-3 text-[12px] text-[#9b9a97]" style={{ fontWeight: 400 }}>
                          <span className="flex items-center gap-1">
                            {STATUS_CONFIG[lead.status]?.iconKey && <IconFromKey iconKey={STATUS_CONFIG[lead.status].iconKey} size={11} color={STATUS_CONFIG[lead.status].iconColor} />}
                            {STATUS_CONFIG[lead.status]?.text ?? lead.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[12px] text-[#9b9a97]" style={{ fontWeight: 400 }}>
                          {lead.emails.filter((e) => e.status === "sent").length}/{lead.emails.length} sent
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLead(lead);
                            }}
                            className="text-[11px] text-[#9b9a97] hover:text-foreground transition-colors"
                            style={{ fontWeight: 400 }}
                          >
                            View →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full">
                  <thead className="sticky top-0 bg-white border-b border-[#e9e9e7]">
                    <tr>
                      {["Account", "Score", "Total Leads", "Hot Leads", "Status"].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-[10px] text-[#9b9a97] uppercase tracking-wider"
                          style={{ fontWeight: 500 }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map((acc) => (
                      <tr
                        key={acc.name}
                        onClick={() => acc.leads[0] && setSelectedLead(acc.leads[0])}
                        className="border-b border-[#e9e9e7]/60 last:border-0 hover:bg-[#fafaf9] transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-3 text-[13px] text-foreground" style={{ fontWeight: 500 }}>
                          {acc.name}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-foreground" style={{ fontWeight: 500 }}>
                          {acc.score}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-[#9b9a97]" style={{ fontWeight: 400 }}>
                          {acc.leadCount}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-[#9b9a97]" style={{ fontWeight: 400 }}>
                          {acc.hotLeads}
                        </td>
                        <td className="px-4 py-3 text-[12px] text-[#9b9a97]" style={{ fontWeight: 400 }}>
                          {acc.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Lead drawer over the modal */}
            {selectedLead && (
              <LeadDrawer
                lead={selectedLead}
                onClose={() => setSelectedLead(null)}
                onTweakInChat={(name, company) => {
                  setSelectedLead(null);
                  onClose();
                  onTweakInChat(name, company);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
