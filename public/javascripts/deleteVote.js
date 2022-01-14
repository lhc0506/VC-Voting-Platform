const deleteButton = document.querySelector(".delete");
deleteButton.addEventListener("click", () => {
  fetch("/movies")
  .then(function(response) {
    return response.json();
  })
});