// These offers must not be conditional on posting a Google review.
const coupons = [
  { discount: "10% OFF", title: "Get 10% off on your next purchase", code: "SAVE10", valid: "Valid this month" },
  { discount: "₹200 OFF", title: "Save ₹200 on orders above ₹1,000", code: "SAVE200", valid: "Min. purchase ₹1,000" },
  { discount: "15% OFF", title: "Special store discount", code: "REVIEW15", valid: "One-time offer" }
];

const couponsList = document.getElementById("couponsList");

coupons.forEach((coupon) => {
  const card = document.createElement("article");
  card.className = "coupon-card";
  card.innerHTML = `
    <div class="coupon-top">
      <div class="coupon-discount">${coupon.discount}</div>
      <span class="coupon-code">${coupon.code}</span>
    </div>
    <div class="coupon-title">${coupon.title}</div>
    <div class="coupon-valid">${coupon.valid}</div>
    <button class="coupon-copy" type="button" data-code="${coupon.code}">Copy Coupon Code</button>
  `;
  couponsList.appendChild(card);
});

document.querySelectorAll(".coupon-copy").forEach((button) => {
  button.addEventListener("click", async () => {
    const code = button.dataset.code;
    try {
      await navigator.clipboard.writeText(code);
      showToast(`Coupon ${code} copied!`);
    } catch (error) {
      const textarea = document.createElement("textarea");
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
      showToast(`Coupon ${code} copied!`);
    }
  });
});

// QR links can pass ?category=...&reviewUrl=...
const params = new URLSearchParams(window.location.search);
const category = (params.get("category") || "general").toLowerCase().trim();
const suppliedUrl = params.get("reviewUrl") || "";
let googleReviewUrl = "";
try {
  const parsed = new URL(suppliedUrl);
  if (parsed.protocol === "https:" && (parsed.hostname === "google.com" || parsed.hostname.endsWith(".google.com") || parsed.hostname === "g.page" || parsed.hostname === "maps.app.goo.gl")) googleReviewUrl = parsed.href;
} catch (_) {}

// Prompts help visitors describe their own experiences, without inventing testimonials.
const topics = {
  restaurant: ["food or drinks", "service and wait time", "ambience and cleanliness"],
  cafe: ["coffee or food", "staff and service", "ambience"],
  hospital: ["appointment and care", "staff communication", "facilities and waiting time"],
  clinic: ["appointment", "staff and care", "waiting time"],
  salon: ["treatment or haircut", "staff and service", "cleanliness"],
  hotel: ["room and stay", "staff and check-in", "cleanliness and facilities"],
  school: ["learning experience", "teachers and communication", "facilities"],
  shop: ["products purchased", "staff assistance", "price and quality"],
  retail: ["products purchased", "staff assistance", "price and quality"],
  gym: ["workout experience", "trainers", "equipment and cleanliness"],
  general: ["product or service", "staff and communication", "quality and value"]
};
const selectedTopics = topics[category] || topics.general;
const prompts = [
  `I visited for ${selectedTopics[0]}. What stood out to me was [share your real experience].`,
  `My experience with ${selectedTopics[1]} was [describe what happened]. I felt [your honest opinion].`,
  `Regarding ${selectedTopics[2]}, I noticed [specific details from your visit].`,
  `I chose this place because [your reason]. My experience was [what actually happened].`,
  `One thing I appreciated or would improve was [your real observation]. Overall, I felt [your opinion].`,
  `During my visit, [describe your experience]. The best or most challenging part was [real detail].`,
  `I would describe the ${selectedTopics[0]} as [your honest description], because [explain why].`,
  `For anyone considering this place, my experience was [your personal experience and recommendation, if any].`
];
const reviewText = document.getElementById("reviewText");
const copyBtn = document.getElementById("copyBtn");
const ideaBtn = document.getElementById("ideaBtn");
const googleBtn = document.getElementById("googleBtn");
const toast = document.getElementById("toast");
let currentIndex = 0;
reviewText.value = prompts[currentIndex];
ideaBtn.addEventListener("click", () => {
  const currentText = reviewText.value.trim();
  const isSuggestion = prompts.includes(currentText);
  if (!isSuggestion && currentText && !window.confirm("Replace your edited review with another suggestion?")) return;
  currentIndex = (currentIndex + 1) % prompts.length;
  reviewText.value = prompts[currentIndex];
  reviewText.dispatchEvent(new Event("input", { bubbles: true }));
  showToast(`Suggestion ${currentIndex + 1} of ${prompts.length}`);
});
copyBtn.addEventListener("click", async () => {
  const value = reviewText.value.trim();
  if (!value) return showToast("Please write your experience first.");
  try { await navigator.clipboard.writeText(value); }
  catch (_) {
    reviewText.focus(); reviewText.select();
    document.execCommand("copy");
  }
  showToast("Your draft was copied. Edit it to reflect your experience.");
});
googleBtn.addEventListener("click", async () => {
  const draft = reviewText.value.trim();
  if (!draft) return showToast("Please write your review first.");
  try { await navigator.clipboard.writeText(draft); } catch (_) { reviewText.focus(); reviewText.select(); document.execCommand("copy"); }
  showToast("Review copied! Paste it on Google after checking it.");
  if (!googleReviewUrl) return showToast("Google review link not configured. Please contact the page owner.");
  window.open(googleReviewUrl, "_blank", "noopener,noreferrer");
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

// Google Identity Services: user must explicitly sign in and consent.
// The credential contains a profile claim; for production authentication,
// verify the ID token on a trusted backend before granting any access.
const clientId = document.querySelector('meta[name="google-client-id"]').content;
const signInArea = document.getElementById('googleSignIn');
const signOutBtn = document.getElementById('signOutBtn');
function displayReviewer(profile) {
  document.getElementById('profileName').textContent = profile.name || 'Google user';
  document.getElementById('profileHint').textContent = 'Signed in with Google';
  const avatar = document.getElementById('profileAvatar');
  avatar.textContent = '';
  if (profile.picture && /^https:\/\//.test(profile.picture)) {
    const img = document.createElement('img'); img.src = profile.picture;
    img.alt = 'Your Google profile photo'; img.referrerPolicy = 'no-referrer';
    img.onerror = () => { avatar.textContent = '👤'; };
    avatar.appendChild(img);
  } else avatar.textContent = '👤';
  signInArea.hidden = true;
  signOutBtn.hidden = false;
}
function decodeJwtPayload(jwt) {
  const part = jwt.split('.')[1];
  return JSON.parse(decodeURIComponent(Array.from(atob(part.replace(/-/g,'+').replace(/_/g,'/')), c => '%' + c.charCodeAt(0).toString(16).padStart(2,'0')).join('')));
}
function initializeSignIn() {
  if (!window.google?.accounts?.id) return setTimeout(initializeSignIn, 150);
  if (clientId.startsWith('YOUR_')) {
    signInArea.textContent = 'Google Sign-In setup required: add your OAuth Client ID in index.html.';
    return;
  }
  google.accounts.id.initialize({client_id: clientId, callback: (response) => {
    try { displayReviewer(decodeJwtPayload(response.credential)); }
    catch (_) { showToast('Unable to load Google profile. Please try again.'); }
  }});
  google.accounts.id.renderButton(signInArea, {theme:'outline',size:'large',text:'signin_with',shape:'pill'});
}
signOutBtn.addEventListener('click', () => {
  google.accounts.id.disableAutoSelect();
  document.getElementById('profileName').textContent = 'Your Google profile';
  document.getElementById('profileHint').textContent = 'Sign in to show your photo';
  document.getElementById('profileAvatar').textContent = '👤';
  signInArea.hidden = false;
  signOutBtn.hidden = true;
});
initializeSignIn();
