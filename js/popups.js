function closePopup() {
  document.getElementById("popup").style.visibility = "hidden";
}

// Placeholder function for confirmation action
function confirmAction() {
  closePopup();
}

function togglePopup() {
  const popup = document.getElementById("supportPopup");
  popup.classList.toggle("active");
}
