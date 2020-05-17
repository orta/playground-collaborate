export const addCollabCSS = () => {
  if(document.getElementById('playground-collab-css')) return

  const sheet = document.createElement('style')
  sheet.id = 'playground-collab-css'
  sheet.innerHTML = `
div {
  
}
`;
  document.body.appendChild(sheet);
}
