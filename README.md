# Piper TTS Preview

A simple website for browsing and previewing the official Piper TTS voices.

## Live Demo

[https://piper-tts-preview.vercel.app](https://piper-tts-preview.vercel.app)

## Features

- Browse the current Piper voice catalog
- Search by language, voice name, quality, or model key
- Filter single-speaker and multi-speaker models
- Preview official sample clips directly in the browser
- Generate custom-text audio in the browser with the selected Piper voice
- Jump from each card to the corresponding model files on Hugging Face

## Local Development

Serve the project with any static file server. For example:

```bash
python3 -m http.server 4173
```

Then open `http://127.0.0.1:4173`.

## Data Source

- Voice metadata: official `voices.json` from `rhasspy/piper-samples`
- Preview audio: official sample clips hosted at `rhasspy.github.io/piper-samples`
