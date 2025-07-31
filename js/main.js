const STORAGE_KEY = "resumeData";
const AUTO_SAVE_DELAY = 1000;

function saveResumeData() {
  const editableElements = document.querySelectorAll(".editable");
  const data = {};

  editableElements.forEach((el, index) => {
    data[`editable-${index}`] = el.innerHTML;
  });

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    console.log("Resume data saved");
  } catch (e) {
    console.error("Failed to save data:", e);
  }
}

function loadResumeData() {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (!savedData) return;

    const data = JSON.parse(savedData);
    const editableElements = document.querySelectorAll(".editable");

    editableElements.forEach((el, index) => {
      const key = `editable-${index}`;
      if (data[key]) {
        el.innerHTML = data[key];
      }
    });

    console.log("Resume data loaded");
  } catch (e) {
    console.error("Failed to load data:", e);
  }
}

function createRipple(event) {
  const element = event.currentTarget;
  const circle = document.createElement("span");
  const diameter = Math.max(element.clientWidth, element.clientHeight);
  const radius = diameter / 2;

  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left =
    `${event.clientX - element.getBoundingClientRect().left - radius}px`;
  circle.style.top =
    `${event.clientY - element.getBoundingClientRect().top - radius}px`;
  circle.classList.add("ripple");

  const ripple = element.getElementsByClassName("ripple")[0];
  if (ripple) {
    ripple.remove();
  }

  element.appendChild(circle);
}

document.addEventListener("DOMContentLoaded", function () {
  const editableElements = document.querySelectorAll(".editable");

  editableElements.forEach((element) => {
    element.setAttribute("contenteditable", "true");

    element.addEventListener("paste", function (e) {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData(
        "text/plain",
      );
      document.execCommand("insertText", false, text);
    });

    let saveTimeout;
    element.addEventListener("input", () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(saveResumeData, AUTO_SAVE_DELAY);
    });
  });

  loadResumeData();

  const rippleElements = document.querySelectorAll(
    "button, .card, .editable, .language-item, .education-item, .interest-tag, .tool-icon, .job",
  );

  rippleElements.forEach((element) => {
    element.addEventListener("click", createRipple);
  });

  document
    .getElementById("download-pdf")
    ?.addEventListener("click", function () {
      saveResumeData();

      const button = this;
      const originalText = button.innerHTML;
      button.innerHTML = "Generating PDF...";
      button.disabled = true;

      if (typeof html2canvas === "undefined" || typeof jspdf === "undefined") {
        console.error("PDF libraries not loaded");
        button.innerHTML = "Error! Retry?";
        button.disabled = false;
        return;
      }

      const element = document.body;
      html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      })
        .then((canvas) => {
          const imgData = canvas.toDataURL("image/jpeg", 0.95);
          const pdf = new jspdf.jsPDF("p", "mm", "a4");
          const imgProps = pdf.getImageProperties(imgData);
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

          pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
          pdf.save("CV.pdf");

          button.innerHTML = originalText;
          button.disabled = false;
        })
        .catch((error) => {
          console.error("PDF generation failed:", error);
          button.innerHTML = "Error! Retry?";
          button.disabled = false;
        });
    });

  const profileImg = document.querySelector(".profile-photo");
  if (profileImg?.complete) {
    profileImg.style.opacity = 1;
  } else if (profileImg) {
    profileImg.onload = () => {
      profileImg.style.opacity = 1;
    };
  }

  window.addEventListener("load", () => {
    const timing = performance.timing;
    const loadTime = timing.loadEventEnd - timing.navigationStart;
  });
});