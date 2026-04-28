const SAMPLE_BASE_URL = "https://rhasspy.github.io/piper-samples/samples";
const MODEL_BASE_URL = "https://huggingface.co/rhasspy/piper-voices/tree/main";
const QUALITY_ORDER = ["x_low", "low", "medium", "high"];

const state = {
  voices: [],
  filters: {
    search: "",
    language: "",
    quality: "",
    speakerType: "",
  },
};

const elements = {
  searchInput: document.querySelector("#search-input"),
  languageFilter: document.querySelector("#language-filter"),
  qualityFilter: document.querySelector("#quality-filter"),
  speakerFilter: document.querySelector("#speaker-filter"),
  voiceGrid: document.querySelector("#voice-grid"),
  resultsSummary: document.querySelector("#results-summary"),
  voiceCount: document.querySelector("#voice-count"),
  languageCount: document.querySelector("#language-count"),
  multispeakerCount: document.querySelector("#multispeaker-count"),
  template: document.querySelector("#voice-card-template"),
};

function formatLanguage(voice) {
  const { name_native, name_english, country_english } = voice.language;
  return `${name_native} • ${name_english} (${country_english})`;
}

function getLanguageFamily(languageCode) {
  return languageCode.split("_")[0];
}

function getSampleBasePath(voice) {
  const family = getLanguageFamily(voice.language.code);
  return `${SAMPLE_BASE_URL}/${family}/${voice.language.code}/${voice.name}/${voice.quality}`;
}

function getModelUrl(voice) {
  const family = getLanguageFamily(voice.language.code);
  return `${MODEL_BASE_URL}/${family}/${voice.language.code}/${voice.name}/${voice.quality}/`;
}

function getSpeakerEntries(voice) {
  if (voice.num_speakers <= 1) {
    return [{ label: "Default", value: "0" }];
  }

  return Object.entries(voice.speaker_id_map)
    .sort((a, b) => a[1] - b[1])
    .map(([name, id]) => ({
      label: `${name} (${id})`,
      value: String(id),
    }));
}

function normalizeVoices(rawVoices) {
  return Object.values(rawVoices)
    .filter((voice) => voice.language && voice.name && voice.quality)
    .sort((a, b) => {
      const languageCompare = a.language.code.localeCompare(b.language.code);
      if (languageCompare !== 0) return languageCompare;

      const nameCompare = a.name.localeCompare(b.name);
      if (nameCompare !== 0) return nameCompare;

      return QUALITY_ORDER.indexOf(a.quality) - QUALITY_ORDER.indexOf(b.quality);
    });
}

function populateFilters(voices) {
  const languageMap = new Map();
  const qualities = new Set();

  voices.forEach((voice) => {
    languageMap.set(voice.language.code, formatLanguage(voice));
    qualities.add(voice.quality);
  });

  [...languageMap.entries()]
    .sort((a, b) => a[1].localeCompare(b[1]))
    .forEach(([code, label]) => {
      const option = document.createElement("option");
      option.value = code;
      option.textContent = label;
      elements.languageFilter.append(option);
    });

  [...qualities]
    .sort((a, b) => QUALITY_ORDER.indexOf(a) - QUALITY_ORDER.indexOf(b))
    .forEach((quality) => {
      const option = document.createElement("option");
      option.value = quality;
      option.textContent = quality;
      elements.qualityFilter.append(option);
    });
}

function updateStats(voices) {
  const uniqueLanguages = new Set(voices.map((voice) => voice.language.code));
  const multiSpeakerCount = voices.filter((voice) => voice.num_speakers > 1).length;

  elements.voiceCount.textContent = voices.length.toString();
  elements.languageCount.textContent = uniqueLanguages.size.toString();
  elements.multispeakerCount.textContent = multiSpeakerCount.toString();
}

function getFilteredVoices() {
  const search = state.filters.search.trim().toLowerCase();

  return state.voices.filter((voice) => {
    if (state.filters.language && voice.language.code !== state.filters.language) {
      return false;
    }

    if (state.filters.quality && voice.quality !== state.filters.quality) {
      return false;
    }

    if (state.filters.speakerType === "single" && voice.num_speakers > 1) {
      return false;
    }

    if (state.filters.speakerType === "multi" && voice.num_speakers <= 1) {
      return false;
    }

    if (!search) {
      return true;
    }

    const haystack = [
      voice.key,
      voice.name,
      voice.language.code,
      voice.language.name_english,
      voice.language.name_native,
      voice.language.country_english,
      voice.quality,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(search);
  });
}

function updateResultsSummary(count) {
  const total = state.voices.length;
  elements.resultsSummary.textContent =
    count === total ? `Showing all ${total} voices.` : `Showing ${count} of ${total} voices.`;
}

function createVoiceCard(voice) {
  const fragment = elements.template.content.cloneNode(true);
  const card = fragment.querySelector(".voice-card");
  const name = fragment.querySelector(".voice-name");
  const language = fragment.querySelector(".voice-language");
  const key = fragment.querySelector(".voice-key");
  const quality = fragment.querySelector(".quality-pill");
  const speakersChip = fragment.querySelector(".speakers-chip");
  const downloadLink = fragment.querySelector(".download-link");
  const audio = fragment.querySelector(".voice-audio");
  const speakerPicker = fragment.querySelector(".speaker-picker");
  const speakerSelect = fragment.querySelector(".speaker-select");
  const speakerEntries = getSpeakerEntries(voice);

  name.textContent = voice.name;
  language.textContent = formatLanguage(voice);
  key.textContent = voice.key;
  quality.textContent = voice.quality;
  speakersChip.textContent =
    voice.num_speakers > 1 ? `${voice.num_speakers} speakers` : "Single speaker";
  downloadLink.href = getModelUrl(voice);

  speakerEntries.forEach((speaker) => {
    const option = document.createElement("option");
    option.value = speaker.value;
    option.textContent = speaker.label;
    speakerSelect.append(option);
  });

  const setAudioSource = () => {
    audio.src = `${getSampleBasePath(voice)}/speaker_${speakerSelect.value}.mp3`;
  };

  if (voice.num_speakers > 1) {
    speakerPicker.hidden = false;
    speakerSelect.addEventListener("change", setAudioSource);
  } else {
    speakerPicker.hidden = true;
  }

  setAudioSource();
  card.dataset.language = voice.language.code;
  card.dataset.quality = voice.quality;

  return fragment;
}

function renderVoices() {
  const filteredVoices = getFilteredVoices();
  elements.voiceGrid.innerHTML = "";
  updateResultsSummary(filteredVoices.length);

  if (filteredVoices.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No voices match those filters yet. Try a broader search.";
    elements.voiceGrid.append(empty);
    return;
  }

  const fragment = document.createDocumentFragment();
  filteredVoices.forEach((voice) => {
    fragment.append(createVoiceCard(voice));
  });

  elements.voiceGrid.append(fragment);
}

function bindControls() {
  elements.searchInput.addEventListener("input", (event) => {
    state.filters.search = event.target.value;
    renderVoices();
  });

  elements.languageFilter.addEventListener("change", (event) => {
    state.filters.language = event.target.value;
    renderVoices();
  });

  elements.qualityFilter.addEventListener("change", (event) => {
    state.filters.quality = event.target.value;
    renderVoices();
  });

  elements.speakerFilter.addEventListener("change", (event) => {
    state.filters.speakerType = event.target.value;
    renderVoices();
  });
}

async function init() {
  try {
    const response = await fetch("./voices.json");
    const rawVoices = await response.json();
    const voices = normalizeVoices(rawVoices);

    state.voices = voices;
    populateFilters(voices);
    updateStats(voices);
    bindControls();
    renderVoices();
  } catch (error) {
    elements.resultsSummary.textContent = "Could not load the Piper voice catalog.";
    elements.voiceGrid.innerHTML =
      '<div class="empty-state">The local voice metadata could not be loaded. Make sure you are serving this folder through a local web server.</div>';
    console.error(error);
  }
}

init();
