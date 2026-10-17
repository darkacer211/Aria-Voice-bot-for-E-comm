# Aria – 3-5 Minute Demo Video Script & Submission Guide

This document contains the step-by-step recording script for a 3–5 minute video demonstration of **Aria**, the AI Voice Customer Support Agent for **AURA**, along with the submission approach note.

---

## 1. Approach Note (Copy & Paste for Submission Email)

> **Approach Note:**
> We engineered Aria using Gemini Live's native bidirectional audio streaming over WebSockets, pairing client-side ephemeral token authentication with an authoritative backend business policy engine. By offloading date calculations, cancellation eligibility, and shipping fees to server-computed flags rather than model reasoning, we eliminated hallucinations while maintaining sub-second voice latency and instant barge-in interruption. The system concludes each session by piping full call context into a dedicated Gemini model with strict JSON schema enforcement for zero-defect CRM logging.

---

## 2. 3–5 Minute Video Walkthrough Script

| Timestamp | Screen / Visual Action | Spoken Narration (What to Say) |
| :--- | :--- | :--- |
| **0:00 – 0:40**<br>*Introduction & Architecture* | Show the clean dashboard on `http://localhost:3000`. Point to the header, the state indicator, and the architecture diagram in the README. | *"Hi everyone, this is Aria, a real-time, browser-based AI Voice Customer Support Agent built for AURA. Instead of a slow cascaded pipeline chaining Speech-to-Text, an LLM, and Text-to-Speech, Aria connects directly to Gemini Live API's native audio streaming over WebSockets. We mint secure, short-lived ephemeral tokens from our Next.js backend so the master API key never touches the browser. All policy calculations—like 7-day return windows and cancellation rules—are computed authoritatively on our server to prevent model hallucination."* |
| **0:40 – 1:35**<br>*Order Lookup & Live Tool Call* | Click **Start Call with Aria**. Show the state change from *Connecting* to *Listening*. When Aria greets, say: *"Where is my order O R D one zero one?"*<br>Show the tool call drawer populating in real time with latency counter. | *"Let's start a call. Aria greets us with a warm Indian-English voice. Now I'll ask about order ORD-101. Notice Aria speaks a quick bridge phrase, 'Sure, let me check that for you', while invoking our `get_order_details` tool. The tool returns that ORD-101 is out for delivery with BlueDart, expected by 6 PM today, and Aria reads it out naturally without reading URLs or bullet points."* |
| **1:35 – 2:20**<br>*Barge-In (Interruption) & Cancellation* | While Aria is talking about tracking, interrupt mid-sentence: *"Can I cancel this order?"* Show how Aria stops speaking immediately. | *"Notice how I interrupted Aria mid-sentence, and audio stopped playing immediately. That's our zero-latency barge-in handled via the Web Audio API and Gemini's Voice Activity Detection. When I ask to cancel ORD-101, Aria checks the backend policy flag: because it's already Out for Delivery, it cannot be cancelled, but she politely explains I can refuse delivery at the doorstep."* |
| **2:20 – 3:15**<br>*Policy Edge Cases (ORD-102 & ₹499 Fee)* | Say: *"What about order ORD-102? Can I return it?"* Then ask: *"Why was I charged a 50 rupee fee on 499 rupees?"* | *"Now let's test a return for ORD-102. The tool confirms it was delivered 14 days ago. Aria politely denies the return because our policy strictly limits returns to 7 days for unopened products. When I ask why a ₹50 shipping fee applied to an order of ₹499, Aria accurately explains that free shipping requires orders strictly above ₹499."* |
| **3:15 – 3:55**<br>*End Call & Structured Summary* | Click **End Call**. Show the loading state, followed by the Post-Call Structured Summary card. Click **Copy JSON** and show the clean JSON. | *"Now we end the call. The microphone and Web Audio contexts are released immediately. A post-call summary is generated using Gemini 2.5 Flash with strict JSON schema enforcement. We can see the customer intent, resolution status, order ID, policy applied, and sentiment. We can click 'Copy JSON' to sync with a CRM, or download the formatted transcript."* |
| **3:55 – 4:30**<br>*Text Test Mode & Test Suite* | Open **Text Test Mode**, click a preset button like *Flight to Goa* or *Prompt Injection*. Run `npm test` in the terminal to show all 23 unit tests passing. | *"Finally, for evaluators testing without a microphone, our dashboard includes a Text Test Console with one-click presets for all 11 regression scenarios, including prompt injections and out-of-scope queries. In the terminal, all 23 unit tests pass cleanly covering normalization, policy boundaries, and summary validation. Thank you!"* |

---

## 3. Preparation Checklist Before Recording

1. **Environment Setup**:
   - Verify `GEMINI_API_KEY` is present in `.env.local`.
   - Run `npm test` to verify all 23 tests pass.
   - Run `npm run build` to confirm zero build errors.
   - Run `npm run dev` and open Chrome in full screen.
2. **Audio Setup**:
   - Wear headphones to avoid microphone feedback.
   - Allow browser microphone permission when prompted.
   - Speak in a natural, clear voice.
