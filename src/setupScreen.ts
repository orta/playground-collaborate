import type { PluginUtils } from "./vendor/playground";

export const handleSetupScreen = (
  config: { baseURL: string, setup: () => Promise<any | undefined>, didJoinRoom: (room: string) => void },
  utils: PluginUtils
) => {
  const contentContainer = document.createElement("div");
  const ds = utils.createDesignSystem(contentContainer);

  ds.p("This plugin adds support for letting many people open the same playground. There are some constraints:");
  utils.el("<li>Only one person can write, everyone else gets read access</li>", "ul", contentContainer);

  ds.showEmptyScreen("Loading...");

  // This is the auth check
  config.setup().then((response) => {
    ds.clear();

    if (!response) {
      ds.subtitle("Login");

      // I have a commit for a ds.button upcoming
      const button = document.createElement("input");
      button.type = "button";
      button.value = "Login";
      button.onclick = () => {
        const redir = encodeURIComponent(window.location.href)
        const newURL = `${config.baseURL}/.auth/login/microsoftaccount?post_login_redirect_url=${redir}`;
        window.location.href = newURL;
      };
      contentContainer.appendChild(button);

      ds.p("Note: We do not store any login credentials, they live in your cookies, and it's only used for group management as an arbitrary ID.");
      ds.p("Note: Clicking login will send you to a Microsoft OAuth, but there is a GitHub option hidden under 'Sign-in options'.")

    } else {
      const myName = response.user_id;
      const redir = encodeURIComponent(window.location.href)
      const logoutURL = `${config.baseURL}/.auth/logout?post_login_redirect_url=${redir}`;

      ds.p(`Logged in as <strong>${myName}</strong><br /><a href="${logoutURL}">logout</a>`);

      const query = new URLSearchParams(document.location.search || "");
      const room = query.get("join-room");

      const joinRoom = async () => {
        const room = (document.getElementById("collab-new-or-join") as any).value
        const body = { group: room }
        
        await fetch(`${config.baseURL}/api/join`, { method: "POST", credentials: "include", body: JSON.stringify(body) });
        
        config.didJoinRoom(room)
        // :wave 
        contentContainer.parentElement.removeChild(contentContainer)
      };

      const join = document.createElement("input");
      join.type = "button";
      join.value = "Join";
      join.onclick = joinRoom;

      const start = document.createElement("input");
      start.type = "button";
      start.value = "Start";
      start.onclick = joinRoom;

      ds.createTextInput({
        id: "collab-new-or-join",
        placeholder: "Room Name",
        value: room,
        onEnter: joinRoom,
        onChanged: () => {},
      });

      contentContainer.appendChild(join);
      contentContainer.appendChild(start);
    }
  })

  return contentContainer
}
