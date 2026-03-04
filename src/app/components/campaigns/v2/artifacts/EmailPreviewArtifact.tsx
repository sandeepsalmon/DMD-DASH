import { HugeiconsIcon, Mail01Icon } from "../../icons";

export function EmailPreviewArtifact() {
  return (
    <div className="px-5 py-5">
      <div className="border border-[#e9e9e7] rounded-xl overflow-hidden">
        <div className="px-4 py-2.5 bg-[#f7f7f5] border-b border-[#e9e9e7]">
          <span className="text-[12px] text-foreground flex items-center gap-1.5" style={{ fontWeight: 500 }}>
            <HugeiconsIcon icon={Mail01Icon} size={12} /> Email Preview
          </span>
        </div>
        <div className="px-4 py-4 space-y-3">
          <div className="space-y-1">
            <p className="text-[11px] text-[#9b9a97]" style={{ fontWeight: 400 }}>To: Sarah Chen (Acme Corp)</p>
            <p className="text-[11px] text-[#9b9a97]" style={{ fontWeight: 400 }}>
              Subject: "Quick question about your manufacturing stack evaluation"
            </p>
          </div>
          <div className="border-t border-[#e9e9e7] pt-3 space-y-2.5">
            <p className="text-[13px] text-foreground" style={{ fontWeight: 400 }}>Hi Sarah,</p>
            <p className="text-[13px] text-foreground" style={{ fontWeight: 400, lineHeight: 1.6 }}>
              I noticed your team has been exploring our manufacturing solutions — you've visited our
              pricing page a few times this month, and we had a great conversation about enterprise
              security compliance back in February.
            </p>
            <p className="text-[13px] text-foreground" style={{ fontWeight: 400, lineHeight: 1.6 }}>
              Since then, we've launched our SOC 2 compliance module — which directly addresses the
              concerns you raised about audit trails.
            </p>
            <p className="text-[13px] text-foreground" style={{ fontWeight: 400, lineHeight: 1.6 }}>
              Worth a quick chat? Here's my calendar if you'd like to pick a time:{" "}
              <span className="text-blue-600 underline underline-offset-2">docket.io/book/sandeep</span>
            </p>
            <p className="text-[13px] text-foreground pt-1" style={{ fontWeight: 400 }}>
              Best,<br />Sandeep
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
