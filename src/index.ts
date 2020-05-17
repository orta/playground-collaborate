import type { PlaygroundPlugin, PluginUtils } from "./vendor/playground";
import { HubConnectionBuilder, LogLevel, HubConnection } from "@aspnet/signalr";
import { addCollabCSS } from "./css";
import { handleSetupScreen } from "./setupScreen";
import { showRoomStatus } from "./inCollab";
import { AccessResponse } from "./types";
import { startSyncing } from "./sync";

const devBaseFunctionsURL = "http://localhost:7071";
const prodFunctionsURL = "https://playgroundcollab.azurewebsites.net";
const baseURL = prodFunctionsURL; // devBaseFunctionsURL
const authProvider = "microsoftaccount"; // aad, twitter, microsoftaccount, google, facebook

const makePlugin = (utils: PluginUtils) => {
  let connection: HubConnection;
  let container: HTMLDivElement;
  let connected = false;
  let isHost = true;
  let isLoggedIn = false;
  let myID = "";

  const makeConnection = () => {
    if (connection) return connection;
    connection = new HubConnectionBuilder().withUrl(`${baseURL}/api`).configureLogging(LogLevel.Information).build();

    connection
      .start()
      .then(() => {
        connected = true;
      })
      .catch(console.error);

    connection.onclose(() => console.log("disconnected"));
    return connection;
  };

  const getAuthDeets = async (): Promise<any | undefined> => {
    try {
      const response = await fetch(`${baseURL}/.auth/me`, { method: "POST", credentials: "include" });
      if (!response.ok) return undefined;

      const users: AccessResponse[] = await response.json();
      myID = users[0].user_claims.find(
        (c) => c.typ === "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ).val;
      isLoggedIn = true;
      return users[0];
    } catch (error) {
      console.log("Collab: not logged in");
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

    didMount: (sandbox, _container) => {
      container = _container;
      addCollabCSS();

      const app = utils.createDesignSystem(container);
      app.title("Playground Collaborate");


      const didJoinRoom = (room: string) => {
        const connection = makeConnection()
    
        connection.on("update", (msg) => {
          console.log(msg);
        });
    
        startSyncing({ baseURL, room, sandbox });
    
        const roomInfoContainerDiv = showRoomStatus({ baseURL, room, connection }, utils);
        container.appendChild(roomInfoContainerDiv!);
      };

      const setupContainerDiv = handleSetupScreen({ baseURL, setup: getAuthDeets, didJoinRoom }, utils);
      container.appendChild(setupContainerDiv!);
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
