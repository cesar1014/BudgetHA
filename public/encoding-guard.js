(function encodingGuardBootstrap() {
  const SUSPECT_CHAR_RE = /[\u00c2\u00c3\u00e2\ufffd]/;
  const BAD_CHAR_RE = /[\u00c2\u00c3\u00e2\ufffd]/g;
  const MONITORED_ATTRIBUTES = [
    "title",
    "placeholder",
    "aria-label",
    "aria-description",
    "alt",
    "value",
  ];
  const utf8Decoder = new TextDecoder("utf-8");

  function scoreBadChars(text) {
    const matches = String(text ?? "").match(BAD_CHAR_RE);
    return matches ? matches.length : 0;
  }

  function decodeLatin1AsUtf8(text) {
    const source = String(text ?? "");
    const bytes = new Uint8Array(source.length);
    for (let index = 0; index < source.length; index += 1) {
      bytes[index] = source.charCodeAt(index) & 0xff;
    }
    return utf8Decoder.decode(bytes);
  }

  function normalizeMojibake(text) {
    const source = String(text ?? "");
    if (!source || !SUSPECT_CHAR_RE.test(source)) return source;

    const sourceScore = scoreBadChars(source);
    if (sourceScore === 0) return source;

    let decoded = "";
    try {
      decoded = decodeLatin1AsUtf8(source);
    } catch {
      return source;
    }

    if (!decoded || decoded.includes("\ufffd")) return source;

    const decodedScore = scoreBadChars(decoded);
    if (decodedScore >= sourceScore) return source;
    return decoded;
  }

  function normalizeTextNode(node) {
    if (!node || typeof node.nodeValue !== "string") return;
    const normalized = normalizeMojibake(node.nodeValue);
    if (normalized !== node.nodeValue) {
      node.nodeValue = normalized;
    }
  }

  function normalizeElementAttributes(element) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) return;

    for (const attribute of MONITORED_ATTRIBUTES) {
      if (!element.hasAttribute(attribute)) continue;
      const value = element.getAttribute(attribute);
      const normalized = normalizeMojibake(value);
      if (normalized !== value) {
        element.setAttribute(attribute, normalized);
      }
    }

    if (
      element.tagName === "INPUT" &&
      (element.type === "button" || element.type === "submit" || element.type === "reset")
    ) {
      const normalized = normalizeMojibake(element.value);
      if (normalized !== element.value) {
        element.value = normalized;
      }
    }
  }

  function normalizeNodeTree(node) {
    if (!node) return;

    if (node.nodeType === Node.TEXT_NODE) {
      normalizeTextNode(node);
      return;
    }

    if (
      node.nodeType !== Node.ELEMENT_NODE &&
      node.nodeType !== Node.DOCUMENT_NODE &&
      node.nodeType !== Node.DOCUMENT_FRAGMENT_NODE
    ) {
      return;
    }

    const root = node.nodeType === Node.DOCUMENT_NODE ? node.documentElement : node;
    if (!root || root.nodeType !== Node.ELEMENT_NODE) return;

    normalizeElementAttributes(root);

    const textWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let current = textWalker.nextNode();
    while (current) {
      normalizeTextNode(current);
      current = textWalker.nextNode();
    }

    const allElements = root.querySelectorAll("*");
    for (const element of allElements) {
      normalizeElementAttributes(element);
    }
  }

  function startGuard() {
    normalizeNodeTree(document);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData") {
          normalizeTextNode(mutation.target);
          continue;
        }

        if (mutation.type === "attributes") {
          normalizeElementAttributes(mutation.target);
          continue;
        }

        if (mutation.type === "childList") {
          for (const node of mutation.addedNodes) {
            normalizeNodeTree(node);
          }
        }
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: MONITORED_ATTRIBUTES,
    });

    window.__encodingGuard = {
      normalizeMojibake,
      normalizeNodeTree,
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startGuard, { once: true });
  } else {
    startGuard();
  }
})();
