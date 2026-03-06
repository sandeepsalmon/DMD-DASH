export type PageContext = "demand-dashboard" | "conversational-agents" | "email-agent";

export interface SuggestedQuestion {
  id: string;
  label: string;
  fullQuestion: string;
  response: string;
  followUps?: string[];
}

export interface PageAssistantConfig {
  pageKey: PageContext;
  pageLabel: string;
  welcomeMessage: string;
  initialQuestions: string[];
  questions: Record<string, SuggestedQuestion>;
}

// ── Demand Dashboard ──────────────────────────────────────────────────────────

const demandDashboard: PageAssistantConfig = {
  pageKey: "demand-dashboard",
  pageLabel: "Demand Dashboard",
  welcomeMessage:
    "Hi Sandeep -- I can help you understand your pipeline, account engagement, and conversion metrics. What would you like to know?",
  initialQuestions: [
    "dd-pipeline-health",
    "dd-hot-accounts",
    "dd-conversion",
    "dd-channel-perf",
  ],
  questions: {
    "dd-pipeline-health": {
      id: "dd-pipeline-health",
      label: "How's my pipeline looking?",
      fullQuestion: "How is my pipeline health right now?",
      response:
        "Your pipeline is in good shape overall. You have 10 accounts being tracked, with 3 in the decision stage (Acme Corp, Datadog, CloudBase) -- these are your highest-priority deals. 2 accounts are in consideration, and 5 remain in awareness.\n\nThe key concern is that TechFlow and LogiCorp are showing declining engagement trends -- they may need re-engagement sequences before they go completely cold.\n\nYour overall meeting booking rate is 30%, which is above the typical B2B benchmark of 15-20%.",
      followUps: ["dd-declining-accounts", "dd-decision-next-steps"],
    },
    "dd-hot-accounts": {
      id: "dd-hot-accounts",
      label: "Which accounts need attention?",
      fullQuestion: "Which accounts need my immediate attention?",
      response:
        "Three accounts stand out for immediate action:\n\n1. **Anna Kumar at FinServ** -- 100% email open rate and clicked every CTA, but hasn't booked a meeting after 4 emails. She likely needs a direct AE outreach -- a personalized message or phone call could close this.\n\n2. **StartupX (Dave Kim)** -- Opens every email but never clicks. This is a classic CTA mismatch. Switching from a generic demo CTA to a \"Technical Deep Dive\" could unlock engagement.\n\n3. **TechFlow** -- Their 6-month evaluation window is almost up. They went dark 2 days ago. A well-timed re-engagement email acknowledging the timing could restart the conversation.",
      followUps: ["dd-anna-kumar-detail", "dd-reengage-strategy"],
    },
    "dd-conversion": {
      id: "dd-conversion",
      label: "What are my conversion metrics?",
      fullQuestion: "What do my conversion metrics look like across the funnel?",
      response:
        "Here's your funnel breakdown:\n\n- **Awareness to Consideration**: 2 of 5 awareness accounts have progressed (40%).\n- **Consideration to Decision**: 3 of 5 have reached decision stage (60%). This is strong.\n- **Decision to Meeting Booked**: 3 meetings booked from 3 decision-stage accounts (100%).\n- **Overall Meeting Rate**: 3 meetings from 10 accounts = 30%.\n\nYour email open rate of 56% is well above the industry average of 21%. Click rate at 23% is also solid (benchmark: 2.5%). The bottleneck is converting high-engagement leads who open and click but don't book -- Anna Kumar is the clearest example.",
      followUps: ["dd-improve-booking", "dd-benchmark-detail"],
    },
    "dd-channel-perf": {
      id: "dd-channel-perf",
      label: "Compare agent channel performance",
      fullQuestion:
        "How are the conversational agent and email agent performing compared to each other?",
      response:
        "Both channels are contributing, but in different ways:\n\n**Conversational Agent**: 12 total sessions across 7 accounts. Accounts with 2+ sessions move to decision stage 40% faster. Average session is 4 minutes. However, only 3 of 10 accounts have engaged -- there's an untapped opportunity here.\n\n**Email Agent**: 25 emails sent across 10 accounts. 56% average open rate, 23% click rate. Broader reach but the conversational agent drives deeper engagement.\n\n**Key Insight**: Leads who engage with both channels (like Acme Corp and Datadog) are your strongest converters. Consider embedding a \"Chat with our AI\" CTA in nurture emails.",
      followUps: ["dd-cross-channel-strategy"],
    },
    "dd-declining-accounts": {
      id: "dd-declining-accounts",
      label: "How do I re-engage declining accounts?",
      fullQuestion: "What should I do about the declining accounts?",
      response:
        "For TechFlow and LogiCorp, I'd recommend different approaches:\n\n**TechFlow**: Their 6-month evaluation window is closing. Send a concise re-engagement email that acknowledges the timing -- something like 'We know you were evaluating earlier this year. Here's what's changed since then.' Pair it with a fresh case study from their industry.\n\n**LogiCorp**: Less urgent but still needs attention. They've shown zero engagement in 2 days. Try a different channel -- if emails aren't working, trigger a conversational agent prompt on their next website visit.\n\nFor both: avoid sending more of the same. The data shows they've tuned out the current messaging -- change the format, channel, or value proposition.",
    },
    "dd-decision-next-steps": {
      id: "dd-decision-next-steps",
      label: "Next steps for decision-stage accounts?",
      fullQuestion:
        "What are the recommended next steps for my decision-stage accounts?",
      response:
        "Your 3 decision-stage accounts each need different actions:\n\n**Acme Corp** (Score: 92, Meeting booked): Prepare a custom ROI analysis based on their 3 pricing page visits. They care about cost -- lead with hard numbers.\n\n**Datadog** (Score: 88, Meeting booked): Momentum is high. Focus the meeting on technical integration since their conversational agent sessions focused on API questions.\n\n**CloudBase** (Score: 78, Meeting booked): This one converted because of a pre-send CTA upgrade. They responded to a more direct offer. Keep the meeting practical and demo-focused.",
    },
    "dd-anna-kumar-detail": {
      id: "dd-anna-kumar-detail",
      label: "Tell me more about Anna Kumar",
      fullQuestion: "Can you give me more detail on the Anna Kumar situation?",
      response:
        "Anna Kumar is VP Finance at FinServ. Her engagement timeline:\n\n- Opened all 4 emails (100% open rate)\n- Clicked every CTA link (100% click rate)\n- 1 conversational agent session (2 minutes)\n- No meeting booked despite 4 attempts\n\nThis pattern suggests the meeting CTA itself may be the friction point. She might prefer:\n\n1. An async video walkthrough instead of a live meeting\n2. A direct email from an AE (not an automated sequence)\n3. A specific time slot suggestion rather than an open calendar link\n\nI'd recommend having an AE send a personal 3-line email: acknowledge her interest, reference something specific she clicked, and propose a specific 15-minute time.",
    },
    "dd-reengage-strategy": {
      id: "dd-reengage-strategy",
      label: "Best re-engagement strategies?",
      fullQuestion:
        "What re-engagement strategies work best based on the data?",
      response:
        "Based on your current data, three patterns are working:\n\n1. **Pre-send CTA upgrades** are driving 2x the meeting rate. When the AI agent detects high intent signals, upgrading the CTA from 'Learn More' to 'Book a Demo' works significantly better.\n\n2. **Channel switching** works for stalled leads. Accounts not responding to email often re-activate when you switch to the conversational agent (or vice versa).\n\n3. **Timing-aware outreach** matters. TechFlow's 6-month window is a great trigger. Any re-engagement tied to a real-world event outperforms generic follow-ups.\n\nWhat doesn't work: sending more of the same email sequence to accounts showing declining engagement.",
    },
    "dd-improve-booking": {
      id: "dd-improve-booking",
      label: "How to improve meeting booking rate?",
      fullQuestion:
        "How can I improve the meeting booking rate for high-engagement leads?",
      response:
        "Your current booking rate is 30%, already strong. To push it higher:\n\n1. **Reduce CTA friction**: Test offering a 15-minute 'quick chat' instead of a full demo -- lower commitment often converts better.\n\n2. **Add social proof at the CTA moment**: Include a one-line testimonial near the booking link.\n\n3. **Smart timing**: Emails opened within the first 2 hours get 3x more click-through. Schedule sends for when each lead is most active.\n\n4. **Conversational agent nudges**: For leads who have had agent sessions, trigger a follow-up agent message like 'Would you like me to set up a call with our team?' during their next session.",
    },
    "dd-benchmark-detail": {
      id: "dd-benchmark-detail",
      label: "How do I compare to benchmarks?",
      fullQuestion: "How does my performance compare to industry benchmarks?",
      response:
        "You're outperforming most B2B SaaS benchmarks:\n\n| Metric | Yours | Industry Avg |\n|--------|-------|--------------|\n| Email Open Rate | 56% | 21% |\n| Email Click Rate | 23% | 2.5% |\n| Meeting Booking Rate | 30% | 15-20% |\n| Lead-to-Meeting Time | ~5 days | ~14 days |\n\nThe standout is your open rate -- 56% is exceptional. Your click rate at 23% (vs 2.5% avg) indicates highly relevant content.\n\nThe area for improvement is converting clicks to bookings. You have a 23% click rate but only 30% of accounts book. Reducing that gap is your highest-leverage opportunity.",
    },
    "dd-cross-channel-strategy": {
      id: "dd-cross-channel-strategy",
      label: "How to drive cross-channel engagement?",
      fullQuestion:
        "How should I use both channels together more effectively?",
      response:
        "Here's a cross-channel playbook based on what's working:\n\n**For email-only accounts** (7 of 10): Add a 'Chat with Docket AI' CTA as a secondary action in your next email. Position it as 'Get instant answers about [topic they clicked on].'\n\n**For dual-channel accounts** (3 of 10): These are your best leads. Use the conversational agent to surface buying signals in real-time, then have the email agent follow up within 24 hours.\n\n**Specific plays**:\n- StartupX: Dave Kim opens but never clicks email CTAs. A conversational agent prompt on his next site visit might convert him where email hasn't.\n- OldCorp: Previously lost interest over pricing. A conversational agent session where they can ask pricing questions in real-time could address objections that email can't.",
    },
  },
};

// ── Conversational Agents ─────────────────────────────────────────────────────

const conversationalAgents: PageAssistantConfig = {
  pageKey: "conversational-agents",
  pageLabel: "Conversational Agents",
  welcomeMessage:
    "Hi Sandeep -- I can help you understand your agents' performance, optimize interactions, and improve engagement. What would you like to explore?",
  initialQuestions: [
    "ca-performance-overview",
    "ca-engagement-quality",
    "ca-optimization",
    "ca-meeting-conversion",
  ],
  questions: {
    "ca-performance-overview": {
      id: "ca-performance-overview",
      label: "How are my agents performing?",
      fullQuestion: "How are my conversational agents performing overall?",
      response:
        "Here's your agent performance snapshot:\n\n- **Total Interactions**: 8,412 (up 12.3% week-over-week)\n- **Average Engagement Rate**: 14.2% (up 2.1%)\n- **Active Agents**: 4 of 6\n- **Meetings Booked via Agents**: 127 (up 18.7%)\n\nYour Website Agent (voice + chat) is the top performer with 1,264 interactions and 12.58% engagement. The trend lines are all positive -- interaction volume is growing faster than engagement rate, meaning you're attracting new visitors but there's room to improve conversation quality.\n\nTwo agents are currently disabled. Re-activating with updated configs could capture 30-40% more interactions.",
      followUps: ["ca-disabled-agents", "ca-top-performer"],
    },
    "ca-engagement-quality": {
      id: "ca-engagement-quality",
      label: "What's the interaction quality like?",
      fullQuestion: "What does the quality of agent interactions look like?",
      response:
        "Let me break down interaction quality:\n\n**Session Duration**: Average 4 minutes. Sessions over 3 minutes have a 3.2x higher meeting booking rate. About 40% of your sessions hit this threshold.\n\n**Conversation Depth**: Most interactions reach 4-6 message exchanges. The optimal depth is 5-8 messages -- too few means the visitor didn't engage, too many often means the agent couldn't answer their question.\n\n**Drop-off Points**: 35% of visitors leave after the first agent message. This suggests the opening message could be more compelling.\n\n**Resolution Rate**: About 60% of conversations end with either a meeting booked, a resource shared, or a question answered. The other 40% are abandoned -- these are optimization opportunities.",
      followUps: ["ca-reduce-dropoff", "ca-improve-opening"],
    },
    "ca-optimization": {
      id: "ca-optimization",
      label: "How can I optimize my agents?",
      fullQuestion: "What optimizations would improve agent performance?",
      response:
        "Here are the highest-impact optimizations:\n\n1. **Fix the opening message** (est. +20% engagement): Replace generic greetings with page-specific openers. Visitors on your pricing page should hear 'I can help you compare plans' not 'How can I help?'\n\n2. **Re-enable disabled agents** (est. +35% interaction volume): Two agents are offline. Update their knowledge bases and turn them back on.\n\n3. **Add voice to chat-only agents** (est. +15% engagement): Your voice+chat agent has a 54% higher interaction rate than voice-only agents.\n\n4. **Smart handoff timing** (est. +10% meeting rate): Offer to book meetings at the 3-4 message mark when engagement peaks, not at the end.\n\nImplementing all four could increase meetings booked from 127 to approximately 185-200 per week.",
      followUps: ["ca-implement-openers", "ca-handoff-timing"],
    },
    "ca-meeting-conversion": {
      id: "ca-meeting-conversion",
      label: "Agent to meeting conversion rate?",
      fullQuestion:
        "What's the conversion rate from agent conversations to booked meetings?",
      response:
        "Your agent-to-meeting funnel:\n\n- **8,412 interactions** started\n- **3,365 engaged** (40% -- had 3+ messages exchanged)\n- **840 qualified** (25% of engaged -- showed buying signals)\n- **127 meetings booked** (15.1% of qualified, 1.5% of total)\n\nThe 1.5% overall conversion rate is typical for B2B, but the 15.1% qualified-to-meeting rate is above average (benchmark: 10-12%).\n\nThe biggest drop-off is from interaction to engagement (60% leave early). This is where opening message optimization would have the most impact.\n\nInteresting pattern: visitors who come to the agent after opening a marketing email book meetings at 2.3x the rate of organic visitors.",
      followUps: ["ca-qualified-signals", "ca-email-priming"],
    },
    "ca-disabled-agents": {
      id: "ca-disabled-agents",
      label: "Should I re-enable disabled agents?",
      fullQuestion:
        "Should I re-enable the disabled agents? What would that look like?",
      response:
        "Yes, I'd recommend re-enabling both with updated configurations:\n\n**Agent 3 (Voice + Chat)**: Was likely disabled due to outdated responses. Before re-enabling, update its knowledge base with your latest pricing, case studies, and product updates. Given it has both channels, it could become your second-best performer.\n\n**Agent 5 (Voice + Chat)**: Same recommendation. Deploy it on a different section of your site -- for example, dedicated to documentation or developer pages.\n\nExpected impact: Your 4 active agents handle 8,412 interactions. Adding 2 more could capture an additional 2,800-3,400 interactions per week, translating to roughly 40-50 additional meetings booked monthly.",
    },
    "ca-top-performer": {
      id: "ca-top-performer",
      label: "What makes the top agent successful?",
      fullQuestion:
        "What makes my top-performing Website Agent so successful?",
      response:
        "Your leading Website Agent (1,264 interactions, 12.58% engagement) stands out for several reasons:\n\n1. **Dual channel (voice + chat)**: Visitors can choose their preferred mode. This alone accounts for roughly 40% of its advantage.\n\n2. **Traffic placement**: It's on your main website pages with the highest-intent traffic.\n\n3. **Improving over time**: Interactions grew by 445 (+54.33%) and engagement improved by 2.67 points. Both metrics trending up simultaneously suggests it's learning and improving.\n\n4. **Email campaign link**: This agent has a direct connection to your Email Agent, creating a feedback loop where leads from email campaigns are warm and convert faster.\n\nTo replicate: ensure other agents have dual channels, sit on high-intent pages, and are linked to your email nurture sequences.",
    },
    "ca-reduce-dropoff": {
      id: "ca-reduce-dropoff",
      label: "How to reduce conversation drop-off?",
      fullQuestion: "How can I reduce the 35% first-message drop-off rate?",
      response:
        "The 35% first-message drop-off is your biggest lever. Here's a targeted plan:\n\n1. **Personalize the opener**: Use page context. If someone is on the pricing page, open with 'I see you're looking at our plans -- want me to help you find the right one?'\n\n2. **Offer immediate value**: Instead of asking a question, lead with a useful fact. Example: 'Our enterprise plan includes unlimited API calls. I can walk you through the differences.'\n\n3. **Reduce visual friction**: Make the chat window smaller initially (just the opening message), then expand when the visitor responds.\n\n4. **A/B test timing**: Test delaying the chat prompt to 5-10 seconds after page load, or triggering on scroll depth. Visitors who have read some content are 2x more likely to engage.\n\nImplementing these could bring your drop-off from 35% down to 15-20%.",
    },
    "ca-improve-opening": {
      id: "ca-improve-opening",
      label: "Best opening messages?",
      fullQuestion: "What are the best opening messages to use?",
      response:
        "Based on B2B conversation data, here are proven opening message patterns:\n\n**For pricing pages**: 'I can help you compare plans and estimate costs for your team size. Want a quick breakdown?'\n\n**For product pages**: 'Want to see how [specific feature] works in practice? I can show you a quick example.'\n\n**For returning visitors**: 'Welcome back! Last time you were looking at [topic]. Want to pick up where you left off?'\n\n**For email campaign visitors**: 'Thanks for checking out [email topic]. I have some additional details -- interested?'\n\n**Key principles**:\n- Reference what they're already doing\n- Offer something specific (not 'How can I help?')\n- Make it easy to say yes or no (binary questions get 40% more engagement)\n- Keep it under 25 words",
    },
    "ca-implement-openers": {
      id: "ca-implement-openers",
      label: "How to implement page-specific openers?",
      fullQuestion:
        "How would I implement page-specific opening messages?",
      response:
        "Implementation is straightforward:\n\n1. **Create a URL-to-message mapping**: Define 5-8 opening messages based on your key pages (pricing, product features, docs, blog, homepage).\n\n2. **Set fallback rules**: For pages without specific openers, use your best-performing generic message. A question format ('Want to see how X works?') outperforms a statement format ('I can help you with X.').\n\n3. **Test and iterate**: Start with your top 3 pages by traffic. Run each new opener for 1 week, measure engagement rate vs. the generic opener, keep the winner.\n\n4. **Add context awareness**: Pass the referring source to the agent. Visitors from email campaigns should get a different opener than organic traffic. Your email-primed visitors already convert at 2.3x -- a matching opener could push that higher.\n\nTimeline: Could be set up in a day and start showing results within a week.",
    },
    "ca-handoff-timing": {
      id: "ca-handoff-timing",
      label: "When should agents offer meetings?",
      fullQuestion:
        "What's the optimal timing for agents to offer meeting bookings?",
      response:
        "The data points to a sweet spot at messages 3-4 in the conversation:\n\n**Message 1-2**: Too early. The visitor hasn't expressed enough intent. Offering a meeting here feels pushy and increases drop-off by 25%.\n\n**Message 3-4**: Optimal. The visitor has engaged, asked questions, and shown interest. Conversion rate at this point is 18.3% vs. 11.2% at end-of-conversation.\n\n**Message 5-6**: Good but declining. Some visitors have already gotten their answer and are ready to leave.\n\n**Message 7+**: Late. Only 15% of conversations last this long.\n\n**Best approach**: Use a soft CTA at message 3-4 ('Would it be helpful to discuss this with someone from our team?') and a more direct CTA if the conversation continues past message 6.",
    },
    "ca-qualified-signals": {
      id: "ca-qualified-signals",
      label: "What signals indicate a qualified lead?",
      fullQuestion:
        "What signals in agent conversations indicate a qualified lead?",
      response:
        "Your agent conversations reveal several reliable qualification signals:\n\n**Strong buying signals** (80%+ meeting rate when present):\n- Asks about pricing or specific plan features\n- Mentions a timeline ('looking to implement this quarter')\n- References competitors ('how do you compare to X?')\n- Asks about integration with their existing tools\n\n**Moderate signals** (40-60% meeting rate):\n- Asks for case studies or references\n- Questions about team size / scaling\n- Returns for a second session within 48 hours\n\n**Weak signals** (10-20% meeting rate):\n- Generic product questions\n- Single-session, under 2 minutes\n- Only asks about free tier\n\nThe AI agent should be configured to recognize strong signals and immediately offer a meeting, while moderate signals trigger a follow-up email within 24 hours.",
    },
    "ca-email-priming": {
      id: "ca-email-priming",
      label: "How does email priming improve results?",
      fullQuestion:
        "How exactly does email priming improve agent conversation outcomes?",
      response:
        "The email-to-agent pipeline is your most effective conversion path:\n\n**The data**: Visitors who arrive after opening a marketing email book meetings at 2.3x the rate of organic visitors.\n\n**Why it works**:\n1. **Pre-education**: They've already read about your product. They skip the 'what do you do?' phase.\n2. **Intent signal**: Opening an email and then visiting the site is a double-intent signal.\n3. **Conversation context**: If the agent knows they came from a specific email, it can reference the content.\n\n**How to amplify this**:\n- Add 'Talk to our AI' CTAs in all nurture emails\n- Pass email campaign UTM parameters to the agent for context\n- Create agent conversation flows that match each email campaign topic\n- Follow up unconverted agent sessions with a targeted email within 4 hours",
    },
  },
};

// ── Email Agent ───────────────────────────────────────────────────────────────

const emailAgent: PageAssistantConfig = {
  pageKey: "email-agent",
  pageLabel: "Email Agent",
  welcomeMessage:
    "Hi Sandeep -- I can help you understand your email campaigns, optimize performance, and refine audience targeting. What would you like to know?",
  initialQuestions: [
    "ea-campaign-perf",
    "ea-optimization",
    "ea-audience",
    "ea-best-campaign",
  ],
  questions: {
    "ea-campaign-perf": {
      id: "ea-campaign-perf",
      label: "How are my campaigns doing?",
      fullQuestion: "How are my email campaigns performing overall?",
      response:
        "Here's your cross-campaign performance:\n\n- **Pipeline Generated**: $494K across all campaigns\n- **Total Emails Sent**: 498\n- **Average Open Rate**: 42.1% (2x industry average)\n- **Meetings Booked**: 22\n\n**By campaign**:\n- *Re-engage Stalled Pipeline*: Best performer -- 68% open rate, $84K pipeline, 17.6% lead-to-meeting conversion. Only 3 days in.\n- *Webinar Follow-Up*: 51% open rate, 5 meetings from 47 leads. Day 5.\n- *Trial Nurture*: Highest volume (128 leads, 256 emails) but lower engagement at 31%. Still ramping.\n- *Enterprise Upsell*: Paused on Day 12. 45% open rate, $210K pipeline at risk.\n- *Competitive Displacement*: Just launched, 53% open rate -- strong early signal.\n\nBiggest concern: the Enterprise Upsell has been paused for 9 days with $210K pipeline at stake.",
      followUps: ["ea-enterprise-upsell", "ea-trial-nurture-fix"],
    },
    "ea-optimization": {
      id: "ea-optimization",
      label: "How can I improve email performance?",
      fullQuestion:
        "What are the top optimization opportunities for my emails?",
      response:
        "Highest-impact optimizations ranked by potential pipeline impact:\n\n1. **Clone the Re-engage Pipeline subject line pattern** (est. +15% open rate): This campaign's 68% open rate is extraordinary. Replicate the pattern across Competitive Displacement and Trial Nurture.\n\n2. **Fix the Webinar Follow-Up CTA** (est. +3-5 more meetings): 6 Q&A participants opened emails but haven't booked. Switch their CTA from 'Download Case Study' to a personalized demo invite.\n\n3. **Route power trial users to AE** (est. $120K+ pipeline): 12 trial users are hitting plan limits daily. They're self-qualifying -- book them directly.\n\n4. **Resume Enterprise Upsell** (est. $210K pipeline recovery): Laura Martinez (ICP 86) and 2 others are showing renewed pricing activity.\n\n5. **Optimize send times** (est. +8-12% open rate): Your best emails were opened within 2 hours of send. Use per-lead optimal send time.",
      followUps: ["ea-subject-lines", "ea-send-timing"],
    },
    "ea-audience": {
      id: "ea-audience",
      label: "How's my audience targeting?",
      fullQuestion:
        "How effective is my audience targeting and segmentation?",
      response:
        "Your segmentation is working but could be sharper:\n\n**What's working**:\n- Re-engage Pipeline's segment-specific messaging is driving a 68% open rate. Each segment gets a different hook based on their closed-lost reason.\n- Competitive Displacement's narrow targeting (19 leads from Acme competitor companies) is getting 53% opens because the message is hyper-relevant.\n\n**Where targeting is weak**:\n- Trial Nurture treats all 128 leads the same despite very different behavior. Daily active users should get a different sequence than people who never logged in.\n- Webinar Follow-Up doesn't distinguish between Q&A participants and passive viewers. Q&A participants are 3x more likely to book.\n\n**Recommendation**: Move from demographic segmentation (size, industry) to behavioral segmentation (engagement level, feature usage, interaction history). You have the data -- the AI agent can handle the complexity.",
      followUps: ["ea-behavioral-segments", "ea-trial-segments"],
    },
    "ea-best-campaign": {
      id: "ea-best-campaign",
      label: "Why is Re-engage Pipeline so effective?",
      fullQuestion:
        "What makes the Re-engage Pipeline campaign so much more effective than the others?",
      response:
        "The Re-engage Pipeline campaign outperforms because of three things working together:\n\n1. **High-signal audience**: These 34 leads were previously qualified (they made it to pipeline) and 18 recently showed intent by visiting your pricing page. You're not cold-starting -- you're restarting a warm relationship.\n\n2. **Reason-matched messaging**: Instead of one generic re-engagement email, each lead gets a message tailored to WHY they stalled -- pricing objections, timing, or competitor preference.\n\n3. **AI-adaptive CTAs**: The agent dynamically adjusts the CTA based on real-time engagement. A lead who clicks a pricing link gets 'Book a pricing walkthrough', while one who reads a case study gets 'See how [similar company] achieved X.'\n\nThe 17.6% lead-to-meeting conversion (2.9x benchmark) is the direct result. To replicate: use behavioral data to segment, match messaging to the lead's situation, and let the AI adapt CTAs.",
      followUps: ["ea-replicate-success", "ea-adaptive-cta"],
    },
    "ea-enterprise-upsell": {
      id: "ea-enterprise-upsell",
      label: "Should I resume Enterprise Upsell?",
      fullQuestion:
        "Should I resume the Enterprise Upsell campaign that's been paused?",
      response:
        "Yes, resume it -- but with refreshed content. Here's why:\n\nThe campaign was paused 9 days ago, likely because initial results were modest. But three things have changed:\n\n1. **Laura Martinez (ICP 86)** is back on your pricing page, showing renewed interest.\n2. **Two other leads** are also showing activity -- they've opened old emails and visited your features page.\n3. **$210K pipeline** is sitting idle. Even a 10% re-activation rate would generate $21K.\n\n**Before resuming**:\n- Refresh the subject lines (use the Re-engage Pipeline pattern that's getting 68% opens)\n- Write new copy that acknowledges the pause: 'We held off reaching out, but something just came up'\n- Target only the 3 active leads first as a test\n- Change the CTA to a specific value-add (like a custom ROI analysis)",
    },
    "ea-trial-nurture-fix": {
      id: "ea-trial-nurture-fix",
      label: "How to fix Trial Nurture engagement?",
      fullQuestion:
        "The Trial Nurture campaign has low engagement -- how do I fix it?",
      response:
        "Trial Nurture's 31% open rate (vs. your 42% average) needs attention. The problem is treating 128 very different users the same way:\n\n**Power Users** (12 leads, daily active): These don't need nurturing -- they need a sales conversation NOW. Pull them out and route to an AE. Chris Park is the standout: daily active for 6 of 7 trial days, exploring webhooks.\n\n**Active Explorers** (35 leads, 3-5 days active): Engaged but haven't committed. Send feature-specific content based on what they're actually using.\n\n**Dormant Sign-ups** (81 leads, 0-2 days active): Need reactivation, not nurture. Send a 'Here's what you're missing' email.\n\n**Quick wins**:\n1. Extract the 12 power users immediately -- could generate $120K+ in pipeline\n2. Segment the remaining 116 by activity level\n3. Create 3 different email sequences instead of 1",
    },
    "ea-subject-lines": {
      id: "ea-subject-lines",
      label: "What subject line patterns work best?",
      fullQuestion:
        "What subject line patterns are working best across my campaigns?",
      response:
        "Analyzing your 498 emails, here are the winning patterns:\n\n**Top performers (60%+ open rate)**:\n- Personalized reference: '{First name}, about your [specific situation]' -- 72% open rate\n- Direct value: 'Here's the [specific thing] you were looking for' -- 65%\n- Curiosity gap: 'Something changed with [topic they care about]' -- 63%\n\n**Average performers (40-55%)**:\n- Company mention: 'For the {Company} team' -- 48%\n- Question format: 'Have you considered [approach]?' -- 45%\n\n**Underperformers (under 35%)**:\n- Generic value prop: 'Introducing our new [feature]' -- 28%\n- Newsletter-style: 'Your weekly update from Docket' -- 24%\n- Salesy urgency: 'Don't miss out on [offer]' -- 19%\n\n**Key insight**: Subject lines that reference the lead's specific behavior outperform generic ones by 2-3x.",
    },
    "ea-send-timing": {
      id: "ea-send-timing",
      label: "When's the best time to send emails?",
      fullQuestion:
        "When is the optimal time to send emails based on my data?",
      response:
        "Your data shows clear patterns:\n\n**Best overall send windows**:\n- Tuesday 9-10am local time: Highest open rate (52%)\n- Wednesday 2-3pm local time: Highest click rate (28%)\n- Thursday 8-9am local time: Best meeting booking rate\n\n**Worst times**:\n- Monday mornings: Buried under weekend backlog (31% open rate)\n- Friday afternoons: Mentally checked out (22% open rate)\n\n**But the real insight is per-lead timing**: Your top emails were opened within 2 hours of sending. Optimizing for each individual lead's active window is more impactful than finding the 'best' batch time.\n\n**Recommendation**: Switch from batch sending to AI-optimized per-lead send times. The email agent can analyze each lead's historical open patterns and send at their personal optimal time. This typically adds 8-12% to open rates.",
    },
    "ea-behavioral-segments": {
      id: "ea-behavioral-segments",
      label: "How to build behavioral segments?",
      fullQuestion:
        "How should I build behavioral segments for better targeting?",
      response:
        "Here's a practical behavioral segmentation framework using data you already have:\n\n**Tier 1 -- Intent Signals** (highest priority):\n- Pricing page visitors in last 7 days\n- Comparison/competitor page viewers\n- Return visitors (3+ sessions)\n- Demo video watchers (>50% completion)\n\n**Tier 2 -- Engagement Signals**:\n- Email hyper-engagers (open + click on 3+ emails)\n- Conversational agent session participants\n- Content downloaders (case studies, whitepapers)\n\n**Tier 3 -- Fit Signals**:\n- ICP score above 70\n- Company size matches target\n- Tech stack compatibility\n\n**How to apply**:\n- Tier 1: Aggressive, short sequence with direct CTA (book a call)\n- Tier 2: Moderate sequence with value-first CTA (case study, then meeting)\n- Tier 3: Gentle nurture with educational CTA (content, then upgrade)\n\nThe AI email agent can automate this segmentation and adjust in real-time as leads move between tiers.",
    },
    "ea-trial-segments": {
      id: "ea-trial-segments",
      label: "How to segment trial users?",
      fullQuestion:
        "How should I segment the 128 trial users for better email engagement?",
      response:
        "Segment your 128 trial users into 4 behavioral cohorts:\n\n**1. Power Users (12 leads)**: 5+ days active, exploring advanced features. Action: Skip nurture, route to AE. Chris Park is your poster child.\n\n**2. Feature Explorers (23 leads)**: 3-4 days active, trying multiple features. Action: Send feature-specific deep dives based on what they're actually using.\n\n**3. Casual Trialists (47 leads)**: 1-2 days active, basic usage. Action: Send 'quick win' content showing value in under 5 minutes.\n\n**4. Ghost Sign-ups (46 leads)**: Signed up but barely used the product. Action: Send a re-activation email with a specific compelling use case and consider offering an extended trial.\n\nExpected impact: This segmentation should lift your 31% open rate to 45-50% and generate significantly more meetings from the power user cohort.",
    },
    "ea-replicate-success": {
      id: "ea-replicate-success",
      label: "How to replicate Re-engage success?",
      fullQuestion:
        "How can I replicate the Re-engage Pipeline success in other campaigns?",
      response:
        "Apply these three principles across all campaigns:\n\n**1. Start with high-signal audiences**:\n- Webinar Follow-Up: Already good. Sharpen by separating Q&A participants.\n- Trial Nurture: Extract the 12 power users -- your equivalent of 'stalled deals who visited pricing.'\n- Competitive Displacement: Already sharp (19 leads at competitor companies).\n- Enterprise Upsell: Focus on the 3 showing renewed activity, not all 22.\n\n**2. Match messaging to the lead's specific situation**:\n- Webinar: Reference the specific session and questions they asked.\n- Trial: Reference features they've used and where they got stuck.\n- Competitive: Reference specific pain points with their current vendor.\n\n**3. Use adaptive CTAs**:\n- Don't hardcode 'Book a Demo' in every email. Let the AI choose between demo, case study, pricing walkthrough, or technical deep dive based on each lead's behavior.\n\nThe common thread: specificity. The more your email feels like it was written for that one person, the higher it converts.",
    },
    "ea-adaptive-cta": {
      id: "ea-adaptive-cta",
      label: "How do adaptive CTAs work?",
      fullQuestion:
        "How exactly do the AI-adaptive CTAs work in practice?",
      response:
        "The adaptive CTA system works in three layers:\n\n**Layer 1 -- Pre-send signals**: Before each email is sent, the agent checks the lead's recent behavior:\n- Visited pricing page? CTA becomes 'Get a custom quote'\n- Read a case study? CTA becomes 'See how [similar company] achieved this'\n- Had an agent conversation about features? CTA becomes 'Book a technical deep dive'\n\n**Layer 2 -- Send-time upgrade**: If strong intent signals appear between when the email was queued and when it sends, the agent upgrades the CTA. James Wong was queued with 'Learn More', but his pricing page visit triggered an upgrade to 'Book a Demo' -- and he booked.\n\n**Layer 3 -- Post-send adaptation**: If someone opens but doesn't click, the next email's CTA shifts. If they click but don't convert, the follow-up offers a lower-commitment action.\n\nPre-send CTA upgrades drive 2x the meeting rate compared to static CTAs. This is already working in Re-engage Pipeline and could be applied to all campaigns.",
    },
  },
};

// ── Exported config map ───────────────────────────────────────────────────────

export const PAGE_CONFIGS: Record<PageContext, PageAssistantConfig> = {
  "demand-dashboard": demandDashboard,
  "conversational-agents": conversationalAgents,
  "email-agent": emailAgent,
};

export function getPageContext(pathname: string): PageContext {
  if (pathname.startsWith("/conversational-agents")) return "conversational-agents";
  if (pathname.startsWith("/email-agent")) return "email-agent";
  return "demand-dashboard";
}
