# Lahore Toastmasters Agenda Generator

A static web app that generates a formatted A4 meeting agenda as both a **PDF** and **Word (.docx)** file for Lahore Toastmasters Club. No backend, no installation — runs entirely in the browser.

---

## Project Files

```
vcapp/
├── index.html          # HTML structure and layout only
├── app.js              # All JavaScript — form logic, PDF generation, Word generation
├── club-settings.json  # Club defaults — name, vision, mission, location, members, committee
└── meeting.json        # Meeting defaults — date, roles, speakers, table topics
```

---

## Running Locally

You cannot open `index.html` by double-clicking it — the browser will block the data files from loading. You need a simple local server.

**With Python (recommended):**
```bash
cd /path/to/vcapp
python3 -m http.server 5000
```
Then open **http://localhost:5000** in your browser. Press `Ctrl+C` to stop.

**To test on a phone (same Wi-Fi network):**
```bash
python3 -m http.server 5000 --bind 0.0.0.0
```
Then open **http://YOUR_LAPTOP_IP:5000** on your phone (find your IP with `ipconfig getifaddr en0`).

**With Node.js:**
```bash
npx serve .
```

**With VS Code:** Install the **Live Server** extension → right-click `index.html` → Open with Live Server.

---

## Updating Club Defaults

Edit `club-settings.json` directly to change what all users see as defaults on first load.

```json
{
  "club": {
    "name": "LAHORE TOASTMASTERS CLUB - 01214038",
    "vision": "...",
    "mission": "...",
    "meeting_time": "3:00 PM",
    "location": "...",
    "meeting_days": "We meet 1st and 3rd Saturday of the month at 3:00 PM",
    "social_connect": "Follow us on LinkedIn, Facebook, and Instagram..."
  },
  "committee": [
    { "designation": "President", "name": "Dr. Bashir Ahmad" }
  ],
  "members": ["Dr. Bashir Ahmad", "Hira Ashfaq", "..."]
}
```

> **Important:** `members` and `committee` are always loaded fresh from this file on every page load — users can never end up with a stale members list even if they have a saved draft.

## Updating Meeting Defaults

Edit `meeting.json` to change the pre-filled meeting data shown to first-time visitors. All fields are intentionally blank by default so the form starts clean.

```json
{
  "date": "",
  "time": "3:00 PM",
  "meeting_number": "",
  "theme": "",
  "word_of_day": "",
  "word_meaning": "",
  "roles": {
    "toastmaster": "",
    "sergeant_at_arms": "",
    "grammarian": "",
    "timer": "",
    "ah_counter": "",
    "general_evaluator": ""
  },
  "speakers": [],
  "table_topics": { "facilitator": "", "duration": 20 }
}
```

---

## Using the App

### Meeting Details Tab

- **Meeting Information** — date, number, start time (auto-formats on blur), theme, word of the day and meaning
- **Roles** — dropdowns populated from the members list; choose a name or select "Other…" to type a custom name
- **Prepared Speakers** — up to 10 speakers; each card has name, duration, evaluator, topic, and speech project/manual
- **Table Topics** — facilitator name and session duration

### Club Settings Tab

- Club info: name, vision, mission, meeting time, location, meeting days, social media / how to connect
- **Members / Role Players** — editable list that drives all role dropdowns; saved to your browser only
- **Committee Members** — designation + name pairs shown in the left panel of the PDF

---

## Buttons

| Button | What it does |
|---|---|
| **New Meeting** | Clears all meeting fields and removes all speakers — ready for a fresh agenda. Also wipes the saved draft. |
| **Save Draft** | Saves the current form data to your browser's localStorage — survives page refresh, private to your browser |
| **Download Agenda** | Validates required fields (date, meeting number), then generates and downloads both a PDF and a Word (.docx) file simultaneously |

The navbar is sticky — all three buttons are always visible at the top regardless of scroll position.

---

## How User Data Works

No user action ever writes to `club-settings.json` or `meeting.json`. Those files only change when you edit them directly (e.g. on GitHub).

| Data | Controlled by | Where it lives |
|---|---|---|
| Members list | You (edit `club-settings.json`) | Always fetched fresh from the file |
| Committee | You (edit `club-settings.json`) | Always fetched fresh from the file |
| Meeting Days / Social Connect | You (edit `club-settings.json`) | Always fetched fresh from the file |
| Meeting form draft | Each user | Their own browser localStorage |
| Club text fields | Each user (optional) | Their own browser localStorage |

---

## Agenda Structure

**MEETING STARTS**
- SAA opens, plays national anthem, invites President
- President's address
- Toastmaster of the Day: opening remarks, agenda, business session
- Role introductions: General Evaluator → Grammarian → Ah-Counter → Timer

**PREPARED SPEECHES SEGMENT** *(if speakers present)*
- Per speaker: speech title → speech details → evaluator name
- Timer's Report + Voting Reminder

**TABLE TOPICS SEGMENT**
- Impromptu speaking session
- Timer's Report + Voting Reminder

**EVALUATION (FEEDBACK) SEGMENT**
- Feedback per speaker
- Timer's Report + Voting Reminder *(if speakers)*
- Ah-Counter Report → Grammarian Report → Awards Segment → Overall Meeting Report by GE

**MEETING CLOSURE**
- TMOD announcements and wrap-up
- President adjourns

Start times are calculated automatically from the meeting start time.

---

## PDF / Word Layout

- **Header** — club name, meeting number, date · time · reporting time, meeting location
- **Highlight box** — theme on the left, word of the day + meaning on the right
- **Left panel** — club management committee, vision, mission, meeting days, social media info
- **Agenda table** — 4 columns: Time, Duration, Activity, Assigned To; colour-coded by row type
- **Footer** — gold separator line drawn immediately after the last agenda row
- **Page 2+** — compact dark red continuation banner at the top, aligned to the agenda table column

---

## Deployment on GitHub Pages

1. Push `index.html`, `app.js`, `club-settings.json`, and `meeting.json` to a GitHub repository
2. Go to **Settings → Pages → Source: main branch, / (root)**
3. GitHub provides a public URL — share it with anyone who needs to generate an agenda

No environment variables, no build step, no server required.
