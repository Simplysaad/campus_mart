/**
 * toggleDisplay()
 * Function to toggle display of html element
 */
const toggleDisplay = (targetElement, control, event) => {
  console.log(targetElement, control)
  control.addEventListener(event || "click", () => {
    targetElement.style.display = targetElement.style.display === "block" ? "none" : "block"
  })
}
const sidebar = document.querySelector(".sidebar");
const btnShowSidebar = document.getElementById("btnShowSidebar");
const btnHideSidebar = document.getElementById("btnHideSidebar");

toggleDisplay(sidebar, btnShowSidebar);
toggleDisplay(sidebar, btnHideSidebar)

const searchCont = document.querySelector(".search-container")
const btnShowSearch = document.querySelector("#btnShowSearch")
toggleDisplay(searchCont, btnShowSearch)