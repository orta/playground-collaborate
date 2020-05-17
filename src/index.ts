import type { PlaygroundPlugin, PluginUtils } from "./vendor/playground";
import { HubConnectionBuilder, LogLevel, HubConnection } from "@aspnet/signalr";

const devBaseFunctionsURL = "http://localhost:7071";
const prodFunctionsURL = "https://playgroundcollab.azurewebsites.net";
const baseURL = prodFunctionsURL; // devBaseFunctionsURL
const authProvider = "microsoftaccount"; // aad, twitter, microsoftaccount, google, facebook

const makePlugin = (utils: PluginUtils) => {
  let connection: HubConnection;
  let connected = false;
  let isHost = true;
  let isLoggedIn = false;
  let myName = "";

  const getAuthDeets = async (): Promise<any | undefined> => {
    try {
      const response = await fetch(`${baseURL}/.auth/me`, { method: "POST", credentials: "include" });
      const users = await response.json();
      myName = users[0].user_id;
      isLoggedIn = true;
      return users[0];
    } catch (error) {
      console.log("not logged in", error);
      return undefined;
    }
  };

  const customPlugin: PlaygroundPlugin = {
    id: "collab",
    displayName: "Collab",
    shouldBeSelected: () => {
      const query = new URLSearchParams(document.location.search || "");
      return !!query.get("join-room");
    },
    didMount: (sandbox, container) => {
      // Create a design system object to handle
      // making DOM elements which fit the playground (and handle mobile/light/dark etc)
      const app = utils.createDesignSystem(container);
      const { el } = utils;

      app.title("Playground Collaborate");
      app.p("This plugin adds support for letting many people open the same playground. There are some constraints:");
      el("<li>Only one person can write, everyone else gets read access</li>", "ul", container);

      const contentContainer = document.createElement("div");
      const ds = utils.createDesignSystem(contentContainer);
      container.appendChild(contentContainer);

      ds.showEmptyScreen("Loading...");

      getAuthDeets().then(() => {
        ds.clear();

        if (!isLoggedIn) {
          ds.subtitle("Login");

          const button = document.createElement("input");
          button.type = "button";
          button.value = "Login";
          button.onclick = () => {
            const newURL = `${baseURL}/.auth/login/${authProvider}?post_login_redirect_url=${encodeURIComponent(
              window.location.href
            )}`;
            window.location.href = newURL;
          };
          container.appendChild(button);

          ds.p(
            "Note: We do not handle any login credentials, they live in your cookies, and it's only used for group management as an arbitrary ID. Note: This will send you to a Microsoft OAuth, but there is a GitHub option in there (under 'Sign-in options')."
          );
        } else {
          const logoutURL = `${baseURL}/.auth/logout?post_login_redirect_url=${encodeURIComponent(
            window.location.href
          )}`;

          ds.p(`Logged in as <strong>${myName}</strong><br /><a href="${logoutURL}">logout</a>`);

          // ds.subtitle("Host a session");

          const query = new URLSearchParams(document.location.search || "");
          const room = query.get("join-room");

          const joinRoom = async () => {
            const room = (document.getElementById("collab-new-or-join") as any).value
            const body = { group: room }
            const response = await fetch(`${baseURL}/api/join`, { method: "POST", credentials: "include", body: JSON.stringify(body) });
            console.log("R:", response)
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

          container.appendChild(join);
          container.appendChild(start);

          if (!connection) {
            connection = new HubConnectionBuilder()
              .withUrl(`${baseURL}/api`)
              .configureLogging(LogLevel.Information)
              .build();

            connection
              .start()
              .then(() => {})
              .catch(console.error);

            connection.onclose(() => console.log("disconnected"));
          }

          connection.on("update", (msg) => {
            console.log(msg);
          });

          // ds.subtitle("Join a session");
        }
      });

      // You could leave this tab and comeback
    },

    // This is called occasionally as text changes in monaco,
    // it does not directly map 1 keyup to once run of the function
    // because it is intentionally called at most once every 0.3 seconds
    // and then will always run at the end.
    modelChangedDebounce: async (_sandbox, _model) => {
      // Do some work with the new text
    },

    // Gives you a chance to remove anything set up,
    // the container itself if wiped of children after this.
    didUnmount: () => {
      console.log("Removing plugin");
    },
  };

  return customPlugin;
};

export default makePlugin;
