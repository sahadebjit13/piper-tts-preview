# Piper TTS Preview

A simple website for browsing and previewing the official Piper TTS voices.

## Live Demo

[https://sahadebjit13.github.io/piper-tts-preview/](https://sahadebjit13.github.io/piper-tts-preview/)

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

## Credits

This project is a UI wrapper around work created and shared by the Piper community and related open-source projects.

- Piper TTS itself is developed in the Piper project at [OHF-Voice/piper1-gpl](https://github.com/OHF-Voice/piper1-gpl).
- The voice catalog, sample audio layout, and browser demo ideas come from [rhasspy/piper-samples](https://github.com/rhasspy/piper-samples).
- Voice model files are hosted publicly on [rhasspy/piper-voices on Hugging Face](https://huggingface.co/rhasspy/piper-voices).
- In-browser model inference uses [ONNX Runtime Web](https://github.com/microsoft/onnxruntime).

This site repackages those resources into a simpler browsing and testing experience and is not an official Piper project.
