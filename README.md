# IELTS Speaking Auto-Grader for Windows

Standalone Electron desktop application using the Anthropic Claude Messages API.

## Requirements
- Windows 10/11 64-bit
- An Anthropic API key with API billing enabled
- Internet connection when grading

## Build the Windows installer
On a computer with Node.js 20.19+ or 22.12+ installed:

```bash
npm install
npm run dist:win
```

The installer will be created in `dist/IELTS Speaking Auto-Grader Setup 1.0.0.exe`.

## Run in development

```bash
npm install
npm start
```

## API key and privacy
Open the app, enter your Anthropic API key in the settings section, and save it. The key is encrypted with Electron `safeStorage` and kept in the app's per-user data directory. It is never placed in the HTML or sent to any server other than Anthropic's API. Speech transcripts are sent to Anthropic when you click **Grade my speech**. The app does not retain a transcript database.

API requests use Claude Sonnet 4.5 (`claude-sonnet-4-5-20250929`). API usage is billed by Anthropic separately from a Claude.ai subscription.

## Notes
- The score is a practice estimate based on a transcript, not an official IELTS score.
- Pronunciation features that cannot be inferred from text may be marked as not judgeable.
- The installer target is Windows x64.
