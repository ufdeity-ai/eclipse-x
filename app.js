const input = document.getElementById("url-input");
const goBtn = document.getElementById("go-btn");
const iframe = document.getElementById("proxy-frame");
const loading = document.getElementById("loading-message");
const homepage = document.getElementById("homepage");

goBtn.addEventListener("click", () => {
  let url = input.value.trim();
  if (!url) return;

  // Add protocol if missing
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;

  // Show loading overlay
  loading.style.display = "block";

  // Hide homepage and show iframe
  homepage.style.display = "none";
  iframe.style.display = "block";

  // Load the URL via your proxy
  iframe.src = `/proxy?url=${encodeURIComponent(url)}`;
});

iframe.addEventListener("load", () => {
  loading.style.display = "none";
});
