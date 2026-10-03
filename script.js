const coupons = [
  { discount: "10% OFF", title: "Get 10% off on your next purchase", code: "SAVE10", valid: "Valid this month" },
  { discount: "₹200 OFF", title: "Save ₹200 on orders above ₹1,000", code: "SAVE200", valid: "Min. purchase ₹1,000" },
  { discount: "15% OFF", title: "Special discount for Google reviewers", code: "REVIEW15", valid: "One-time offer" }
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

const reviews = [
  "Incredibly professional, responsive, and polite. A truly excellent experience.",
  "Excellent service and a very smooth experience. Everything was handled professionally.",
  "Very helpful, friendly, and responsive. I had a wonderful experience from start to finish.",
  "Professional service, quick response, and excellent support. Highly recommended for a great experience.",
  "A genuinely positive experience. The service was smooth, polite, and professional."
];

const reviewText = document.getElementById("reviewText");
const copyBtn = document.getElementById("copyBtn");
const ideaBtn = document.getElementById("ideaBtn");
const googleBtn = document.getElementById("googleBtn");
const toast = document.getElementById("toast");

let currentIndex = 0;

ideaBtn.addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % reviews.length;
  reviewText.textContent = reviews[currentIndex];

  ideaBtn.classList.add("clicked");
  setTimeout(() => ideaBtn.classList.remove("clicked"), 250);
});

// Edit / Save Review Text
let isEditing = false;

copyBtn.addEventListener("click", () => {

  if (!isEditing) {

    // Start editing
    isEditing = true;

    reviewText.contentEditable = "true";
    reviewText.classList.add("editing");

    // Focus on the review text
    reviewText.focus();

    // Change button to Save Text
    copyBtn.innerHTML = `
      <span class="btn-icon">✓</span>
      Save Text
    `;

    showToast("You can edit the review now.");

  } else {

    // Save the edited text
    isEditing = false;

    reviewText.contentEditable = "false";
    reviewText.classList.remove("editing");

    // Change button back to Edit Text
    copyBtn.innerHTML = `
      <span class="btn-icon">✎</span>
      Edit Text
    `;

    showToast("Review text saved!");

  }

});

googleBtn.addEventListener("click", () => {
  /*
    IMPORTANT:
    Replace the URL below with your real Google review link.

    Example:
    https://g.page/r/YOUR_GOOGLE_REVIEW_LINK/review
  */
  const googleReviewUrl = "https://www.google.com/";

  window.open(googleReviewUrl, "_blank", "noopener,noreferrer");
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}
