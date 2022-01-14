const deleteButton = document.querySelector(".delete");
deleteButton.addEventListener("click", () => {
  fetch(window.location.href, {
    method: "DELETE",
    redirect: "follow",
  })
  .then((response) => {
    console.log(response)
    return response.json()})
  .then((response) => {
    console.log(response.url)
      window.location.href = response.url;
  })
  // .catch()
});