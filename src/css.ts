export const addCollabCSS = () => {
  if(document.getElementById('playground-collab-css')) return

  const sheet = document.createElement('style')
  sheet.id = 'playground-collab-css'
  sheet.innerHTML = `
.collab::before {
    content: "ᛙ";
    position: absolute;
    display: inline-block;
    bottom: -10px;
    font-size: 200%;
    font-weight: bold;
    z-index: 1;
    color: rgb(255, 185, 0) !important;
    text-decoration: none;
    margin: 0px 0px 0px -0.25ch;
}
.collab {
  background-color: rgb(255, 185, 0, 0.3) !important;
}
`;
  document.body.appendChild(sheet);
}
