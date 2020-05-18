export const addCollabCSS = () => {
  if (document.getElementById("playground-collab-css")) return;

  const sheet = document.createElement("style");
  sheet.id = "playground-collab-css";

  const colors = [
    "rgb(163, 0, 255)",
    "rgb(128, 0, 255)",
    "rgb(255, 92, 0)",
    "rgb(143, 255, 0)",
    "rgb(255, 224, 0)",
    "rgb(255, 185, 0)",
    "rgb(51, 0, 255)",
    "rgb(128, 128, 128)",
  ];

  sheet.innerHTML = `
.collab::before {
    content: "ᛙ";
    position: absolute;
    display: inline-block;
    bottom: -10px;
    font-size: 200%;
    font-weight: bold;
    z-index: 1;
    text-decoration: none;
    margin: 0px 0px 0px -0.25ch;
}

${colors
  .map((c, i) => {
    return `
  .co-sel-${i}::before {
    color: ${c} !important;
  }
  
  .co-sel-${i} {
    background-color: ${c.replace(")", ", 0.3)")} !important;
  }
  `;
  })
  .join("")}
`;
  document.body.appendChild(sheet);
};
