const input = document.getElementById("url-input");
const goBtn = document.getElementById("go-btn");
const iframe = document.getElementById("proxy-frame");
const loading = document.getElementById("loading-message");
const homepage = document.getElementById("homepage");

function normalizeAndDetect(input) {
  let value = input.trim();

  // If it looks like a domain but has no protocol, add one
  if (/^[\w-]+\.[\w.-]+/.test(value) && !/^https?:\/\//i.test(value)) {
    value = "https://" + value;
  }

  try {
    new URL(value);
    return { type: "url", value };
  } catch {
    return { type: "search", value };
  }
}

goBtn.addEventListener("click", () => {
  const raw = input.value;
  if (!raw) return;

  const detected = normalizeAndDetect(raw);

  let target;
  if (detected.type === "url") {
    target = detected.value;
  } else {
    target = `https://www.startpage.com/sp/search?q=${encodeURIComponent(
      detected.value
    )}`;
  }

  loading.style.display = "block";
  homepage.style.display = "none";
  iframe.style.display = "block";

  iframe.src = `/proxy?url=${encodeURIComponent(target)}`;
});

// 🔥 THIS IS THE IMPORTANT PART 🔥
iframe.addEventListener("load", () => {
  loading.style.display = "none";

  try {
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    if (!doc) return;

    const links = doc.querySelectorAll("a[href]");
    links.forEach((a) => {
      const href = a.getAttribute("href");
      if (!href) return;

      // Ignore anchors & javascript
      if (href.startsWith("#") || href.startsWith("javascript:")) return;

      // Force SAME TAB + proxy
      a.removeAttribute("target");
      a.href = `/proxy?url=${encodeURIComponent(href)}`;
    });
  } catch (e) {
    // Some pages may restrict DOM access — safe to ignore
  }
});
