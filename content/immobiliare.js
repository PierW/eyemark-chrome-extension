(() => {
  const SITE_KEY = "immobiliare";
  const STORAGE_KEY = "seenListings";
  const ENABLED_KEY = "extensionEnabled";

  let observer = null;
  let lastUrl = location.href;

  function getStorage(callback) {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      callback(result[STORAGE_KEY] || {});
    });
  }

  function markAsSeen(listingId) {
    getStorage((data) => {
      if (!data[SITE_KEY]) data[SITE_KEY] = {};
      if (data[SITE_KEY][listingId]) return;

      data[SITE_KEY][listingId] = true;
      chrome.storage.local.set({ [STORAGE_KEY]: data });
    });
  }

  function processItem(item, seenMap) {
    const listingId = item.id;
    if (!listingId) return;

    if (item.dataset.processed) return;
    item.dataset.processed = "true";

    if (seenMap?.[SITE_KEY]?.[listingId]) {
      item.classList.add("annuncio-gia-visto");
      return;
    }

    item.addEventListener(
      "click",
      () => {
        markAsSeen(listingId);
        item.classList.add("annuncio-gia-visto");
      },
      { once: true }
    );
  }

  function scanItems() {
    const items = document.querySelectorAll("li.nd-list__item[id]");
    if (!items.length) return;

    getStorage((seenMap) => {
      items.forEach((item) => processItem(item, seenMap));
    });
  }

  function observeResults() {
    if (observer) observer.disconnect();

    observer = new MutationObserver(() => {
      scanItems();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  function watchUrlChanges() {
    setInterval(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        scanItems();
      }
    }, 500);
  }

  function init() {
    chrome.storage.local.get([ENABLED_KEY], (result) => {
      if (result[ENABLED_KEY] === false) return;

      scanItems();
      observeResults();
      watchUrlChanges();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
