const ENABLED_KEY = "extensionEnabled";
const STORAGE_KEY = "seenListings";

const enabledCheckbox = document.getElementById("enabled");
const resetButton = document.getElementById("reset");

// Carica stato iniziale
chrome.storage.local.get([ENABLED_KEY], (result) => {
  enabledCheckbox.checked = result[ENABLED_KEY] !== false;
});

// Toggle ON/OFF
enabledCheckbox.addEventListener("change", () => {
  chrome.storage.local.set({
    [ENABLED_KEY]: enabledCheckbox.checked
  }, reloadCurrentTab);
});

// Reset annunci visti
resetButton.addEventListener("click", () => {
  if (!confirm("Vuoi davvero resettare tutti gli annunci visti?")) return;

  chrome.storage.local.set(
    {
      [STORAGE_KEY]: {
        idealista: {},
        immobiliare: {}
      }
    },
    reloadCurrentTab
  );
});

function reloadCurrentTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.reload(tabs[0].id);
    }
  });
}
