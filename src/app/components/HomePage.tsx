import { useState, useRef, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { Separator } from "./ui/separator";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function HomePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    if (inputRef.current) inputRef.current.style.height = "auto";

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content: respond(text) },
      ]);
      setIsTyping(false);
    }, 700 + Math.random() * 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  const empty = messages.length === 0;

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="h-11 px-5 flex items-center shrink-0">
        <span className="text-[13px] text-foreground" style={{ fontWeight: 500 }}>Home</span>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {empty ? (
          <div className="px-6 pt-16 max-w-[520px] mx-auto">
            <p className="text-[22px] text-foreground mb-1.5 text-center" style={{ fontWeight: 500 }}>
              Hey, John
            </p>
            <p className="text-[14px] text-[#9b9a97] mb-8 text-center" style={{ fontWeight: 400, lineHeight: 1.5 }}>
              Ask Docket a question or pick one below.
            </p>

            <div className="flex flex-col gap-1">
              {[
                "Summarize my unresolved conversations",
                "Draft a reply for a billing complaint",
                "What are my team's open issues?",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setInput(q);
                    inputRef.current?.focus();
                  }}
                  className="text-left px-3 py-2 rounded border border-[#e9e9e7] text-[13px] text-foreground/80 hover:bg-[#f7f7f5] transition-colors"
                  style={{ fontWeight: 400 }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="px-6 py-5 max-w-[520px] mx-auto">
            {messages.map((msg, i) => (
              <div key={msg.id} className="mb-5">
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className={`w-[18px] h-[18px] rounded-full flex items-center justify-center text-[8px] shrink-0 ${
                      msg.role === "user"
                        ? "bg-[#e3e2e0] text-foreground/60"
                        : "bg-foreground text-white"
                    }`}
                    style={{ fontWeight: 600 }}
                  >
                    {msg.role === "user" ? "J" : "D"}
                  </div>
                  <span className="text-[11px] text-[#9b9a97]" style={{ fontWeight: 500 }}>
                    {msg.role === "user" ? "You" : "Docket"}
                  </span>
                </div>
                <div className="pl-[26px]">
                  <p
                    className="text-[14px] text-foreground"
                    style={{ fontWeight: 400, lineHeight: 1.6, whiteSpace: "pre-wrap" }}
                  >
                    {msg.content}
                  </p>
                </div>
                {i < messages.length - 1 && <Separator className="mt-5 bg-[#e9e9e7]" />}
              </div>
            ))}

            {isTyping && (
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-[18px] h-[18px] rounded-full bg-foreground flex items-center justify-center text-white text-[8px] shrink-0" style={{ fontWeight: 600 }}>
                    D
                  </div>
                  <span className="text-[11px] text-[#9b9a97]" style={{ fontWeight: 500 }}>Docket</span>
                </div>
                <div className="pl-[26px] flex items-center gap-1 h-5">
                  <span className="w-1 h-1 rounded-full bg-[#9b9a97]/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1 h-1 rounded-full bg-[#9b9a97]/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1 h-1 rounded-full bg-[#9b9a97]/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-5 pb-4 pt-2 shrink-0">
        <div className="max-w-[520px] mx-auto border border-[#e9e9e7] rounded-lg flex items-end gap-1 px-3 py-2 focus-within:border-foreground/20 transition-colors bg-white">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask Docket a question..."
            rows={1}
            className="flex-1 resize-none bg-transparent text-[13px] text-foreground placeholder:text-[#9b9a97] outline-none py-0.5"
            style={{ fontWeight: 400, lineHeight: "20px", maxHeight: 120 }}
          />
          <button
            onClick={send}
            disabled={!input.trim()}
            className="w-6 h-6 rounded bg-foreground text-white flex items-center justify-center shrink-0 disabled:opacity-20 transition-opacity"
          >
            <ArrowUp size={13} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}

function respond(input: string): string {
  const l = input.toLowerCase();
  if (l.includes("unresolved") || l.includes("summarize") || l.includes("open")) {
    return "You have 14 open conversations right now.\n\n5 are waiting on your reply — 2 billing, 2 technical, 1 feature request. The oldest is from 3 days ago (Acme Corp, billing dispute over invoice #4821).\n\nWant me to draft replies for the ones waiting longest?";
  }
  if (l.includes("billing") || l.includes("complaint") || l.includes("reply")) {
    return "Here's a draft:\n\n\"Hi — thanks for reaching out about this. I've looked into your account and can see the charge you're referring to. Let me get this sorted for you. I'll follow up within the hour with a resolution.\"\n\nWant me to adjust the tone or add specifics?";
  }
  if (l.includes("team") || l.includes("issues")) {
    return "Across your team this week:\n\n• 42 conversations resolved (avg response time: 4m)\n• 8 still open, 3 flagged as high priority\n• Sarah has the highest volume at 18 resolved\n\nThe 3 high-priority ones are all from enterprise accounts. Want details?";
  }
  return "Based on your current data, I'd recommend focusing on the 5 conversations that have been waiting more than 24 hours. Two of those are from accounts on your priority list.\n\nWant me to pull those up or help draft responses?";
}
