Gemini said
Here is a high-end, professional README.md for your GitHub repository. It’s written to attract both users and potential collaborators/investors by highlighting the "Premium" nature of the project.

🌌 SplitVision AI
The Financial Mediator for Social Dining. > Transforming messy receipts into a 10-second conversation through Vision + NLP.

SplitVision AI is a premium, split-screen bill-splitting application designed to eliminate the friction of itemizing receipts after group outings. Built with React 19 and powered by Google Gemini 3 Pro, it bridges the gap between raw data (receipt photos) and social action (assigning costs) through a sophisticated "Vision + Chat" workflow.

✨ Key Features
🧠 Autonomous Digitization (The Left Pane)
Gemini 3 Pro Vision: Extracts structured line items, prices, and taxes from receipt images with high precision.

Visual Mapping & Anchoring: Interactive UI where items are visually tracked as Unassigned (Pulsing Amber) or Assigned (Vibrant Indigo).

OCR-to-UI Linking: Tap a line item to see the corresponding bounding box highlighted on the physical receipt photo.

💬 Natural Language Assignment (The Right Pane)
Smart Assistant: No more checkboxes. Type or speak naturally: "Sarah had the pizza and beer, and Dhruv shared the nachos with her."

Fuzzy Name Matching: Intelligently maps colloquial names to messy OCR text (e.g., BRGR_CHZ_99 → "Cheese Burger").

Magic Reconciliation: The AI proactively alerts you if items are missing: "It looks like no one claimed the Truffle Fries. Who should I assign them to?"

⚖️ Proportional Intelligence
Fair Share Logic: Automatically distributes taxes and tips proportionally based on each person’s individual subtotal.

Smart Tipping: One-tap presets (10%, 15%, Round up) that instantly recalculate the entire group's distribution down to the cent.

🎨 Premium Design Language
Dark Mode by Default: Optimized for low-light restaurant environments (Night Cafe palette).

Glassmorphism UI: Built with Plus Jakarta Sans and a sophisticated Slate/Indigo theme for depth and clarity.

Micro-interactions: Smooth animations using Framer Motion—watch a line item physically "split" when shared between friends.

🛠 Tech Stack
Frontend: React 19 + Tailwind CSS

Intelligence: Google Gemini API (gemini-3-pro-preview) for Vision and NLP.

Animations: Framer Motion

State Management: Zustand

Offline Support: PWA (Workbox) + IndexedDB for "Underground/No-Signal" reliability.

🚀 How It Works
Snap: Take a photo of the receipt. The Vision engine digitizes it instantly.

Chat: Tell the AI who ate what. The NLP engine parses intent, identifies people, and handles shared items.

Split: Review the "Leaderboard" summary.

Settle: Export a beautiful invoice-style summary or a payment QR code.

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
