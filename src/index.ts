import type { PlaygroundPlugin, PluginUtils } from "./vendor/playground";
import { HubConnectionBuilder, LogLevel, HubConnection } from "@aspnet/signalr";
import { addCollabCSS } from "./css";
import { showRoomStatus } from "./inRoom";
import { startSyncing as startSyncingUp } from "./syncUp";

const devBaseFunctionsURL = "http://localhost:7071";
const prodFunctionsURL = "https://playgroundcollab.azurewebsites.net";
const baseURL = prodFunctionsURL; // devBaseFunctionsURL

const makePlugin = (utils: PluginUtils) => {
  let connection: HubConnection;
  let container: HTMLDivElement;
  let myName = localStorage.getItem("playground-input-collab-username");

  const query = new URLSearchParams(document.location.search || "");
  const roomFromQuery = query.get("join-room");
  let room = roomFromQuery || localStorage.getItem("playground-input-collab-room");

  const makeConnection = () => {
    if (connection) return connection;
    connection = new HubConnectionBuilder().withUrl(`${baseURL}/api`).configureLogging(LogLevel.Debug).build();
    // @ts-ignore
    window.connection = connection
    connection.onclose(() => console.log("disconnected"));

    connection
      .start()
      .catch(console.error);
    return connection;
  };

  const customPlugin: PlaygroundPlugin = {
    id: "collab",
    displayName: "Collab",
    shouldBeSelected: () => {
      const query = new URLSearchParams(document.location.search || "");
      return !!query.get("join-room");
    },

    didMount: (sandbox, _container) => {
      container = _container;
      addCollabCSS();

      const app = utils.createDesignSystem(container);
      app.title("Playground Collaborate");

      const loginCreds = document.createElement("div")
      container.appendChild(loginCreds)
      const loginDS  = utils.createDesignSystem(loginCreds);

      loginDS.subtitle("Your handle")
      loginDS.createTextInput({ 
        id: "collab-username", 
        keepValueAcrossReloads: true,
        placeholder: "Your handle...",
        onEnter: () => {
          myName 
        },
        onChanged:(text) => {
          myName = text
        }
      })

      loginDS.subtitle("Room")
      loginDS.createTextInput({ 
        id: "collab-room", 
        keepValueAcrossReloads: true,
        placeholder: "Room",
        value: room,
        onEnter: () => "",
        onChanged:(text) => {
          room = text
        }
      })


      const br = document.createElement("br")
      loginCreds.appendChild(br)

      const roomContainer = document.createElement("div")

      loginDS.button({ label: "Connect to server ", onclick: (event) => {
        const button = event.target as HTMLButtonElement
        button.disabled = true
        button.textContent = "Connecting..."

        const connection = makeConnection()
        startSyncingUp({ baseURL, room, sandbox, sender: myName }, connection);

        showRoomStatus({ container: roomContainer, baseURL, room, connection, myName: myName, sandbox}, utils)
        loginDS.clear()
      }})

      container.appendChild(roomContainer)

      loginDS.p("Playground Collaborate adds support for letting many people open the same playground. There are some constraints:");
      utils.el("<li>Only one person can write, everyone else gets read access</li><li>No data, or authentication is stored on our servers</li>", "ul", loginCreds);
    },
  };

  return customPlugin;
};

export default makePlugin;
