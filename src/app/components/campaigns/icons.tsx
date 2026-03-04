import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkBadge02Icon,
  Clock01Icon,
  HourglassIcon,
  Mail01Icon,
  MailSend01Icon,
  ChartLineData02Icon,
  BarChartIcon,
  Target02Icon,
  FlashIcon,
  PencilEdit02Icon,
  PencilEdit01Icon,
  EyeIcon,
  ArrowReloadHorizontalIcon,
  BubbleChatIcon,
  Calendar03Icon,
  AiChat02Icon,
  Globe02Icon,
  Dollar02Icon,
  ClipboardIcon,
  AiMagicIcon,
  PlayIcon,
  Link01Icon,
  Search01Icon,
  AlertCircleIcon,
  FireIcon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  Settings01Icon,
  PauseIcon,
  Copy01Icon,
  Archive01Icon,
  Delete02Icon,
  MoreHorizontalIcon,
  Cancel01Icon,
  Maximize02Icon,
  ChevronDoubleCloseIcon,
  Attachment01Icon,
  StopIcon,
  SparklesIcon,
  Idea01Icon,
  LinkSquare01Icon,
  Presentation01Icon,
  Robot01Icon,
  Refresh01Icon,
  Analytics02Icon,
  WorkflowCircle01Icon,
} from "@hugeicons/core-free-icons";

// ── String-keyed icon map for data-driven rendering ──────────────────────
// Used in: ACTIVITY_LOG, Lead.activity items, AI_INTEL icons, etc.
export const ICON_MAP: Record<string, React.ComponentType> = {
  mail: Mail01Icon,
  "mail-send": MailSend01Icon,
  calendar: Calendar03Icon,
  globe: Globe02Icon,
  robot: AiChat02Icon,
  link: Link01Icon,
  clipboard: ClipboardIcon,
  "chart-bar": BarChartIcon,
  "chart-line": ChartLineData02Icon,
  checkmark: CheckmarkBadge02Icon,
  clock: Clock01Icon,
  hourglass: HourglassIcon,
  target: Target02Icon,
  flash: FlashIcon,
  pencil: PencilEdit02Icon,
  search: Search01Icon,
  alert: AlertCircleIcon,
  fire: FireIcon,
  sparkle: AiMagicIcon,
  chat: BubbleChatIcon,
  dollar: Dollar02Icon,
  workflow: WorkflowCircle01Icon,
  analytics: Analytics02Icon,
  presentation: Presentation01Icon,
  eye: EyeIcon,
  reload: ArrowReloadHorizontalIcon,
  settings: Settings01Icon,
  pause: PauseIcon,
  idea: Idea01Icon,
};

// ── Helper: render an icon from a string key ─────────────────────────────
export function IconFromKey({
  iconKey,
  size = 13,
  className,
  color,
}: {
  iconKey: string;
  size?: number;
  className?: string;
  color?: string;
}) {
  const icon = ICON_MAP[iconKey];
  if (!icon) return null;
  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      color={color ?? "currentColor"}
      className={className}
    />
  );
}

// ── Re-export everything for component imports ───────────────────────────
export {
  HugeiconsIcon,
  CheckmarkBadge02Icon,
  Clock01Icon,
  HourglassIcon,
  Mail01Icon,
  MailSend01Icon,
  ChartLineData02Icon,
  BarChartIcon,
  Target02Icon,
  FlashIcon,
  PencilEdit02Icon,
  PencilEdit01Icon,
  EyeIcon,
  ArrowReloadHorizontalIcon,
  BubbleChatIcon,
  Calendar03Icon,
  AiChat02Icon,
  Globe02Icon,
  Dollar02Icon,
  ClipboardIcon,
  AiMagicIcon,
  PlayIcon,
  Link01Icon,
  Search01Icon,
  AlertCircleIcon,
  FireIcon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  Settings01Icon,
  PauseIcon,
  Copy01Icon,
  Archive01Icon,
  Delete02Icon,
  MoreHorizontalIcon,
  Cancel01Icon,
  Maximize02Icon,
  Attachment01Icon,
  StopIcon,
  SparklesIcon,
  Idea01Icon,
  LinkSquare01Icon,
  Presentation01Icon,
  Robot01Icon,
  Refresh01Icon,
  Analytics02Icon,
  WorkflowCircle01Icon,
};
