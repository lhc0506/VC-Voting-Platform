const options = document.querySelector(".optionForm");
const addOptionButton = document.querySelector(".addOption");

addOptionButton.addEventListener("click", (event) => {
  const option = document.createElement("input");
  const br = document.createElement("br");
  option.type = "string";
  option.name = "option[]";
  options.insertBefore(option, addOptionButton);
  options.insertBefore(br, addOptionButton);
});
