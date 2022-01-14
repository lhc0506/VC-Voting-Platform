const deleteButton = document.querySelector(".delete");
deleteButton.addEventListener("click", () => {
  fetch(window.location.href, {
    method: "DELETE",
    redirect: "follow",
  })
  .then((response) => {
    return response.json()
  })
  .then((response) => {
    window.location.href = response.url;
  });
});
