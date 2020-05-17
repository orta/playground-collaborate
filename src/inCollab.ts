import type { PluginUtils } from "./vendor/playground";
import { HubConnection } from "@aspnet/signalr";

export const showRoomStatus = (
  config: { baseURL: string, room: string, connection: HubConnection },
  utils: PluginUtils
) => {
  const contentContainer = document.createElement("div");
  const ds = utils.createDesignSystem(contentContainer);

  const shareLink = `${window.location.href}?join-room=${config.room}&install-plugin=playground-collaborate`
  ds.subtitle(`Room: <code>${config.room}</code> - <a href='${shareLink}'>invite</a>`);

  config.connection.on("update", (msg) => {
    console.log(msg);
  });


  return contentContainer
}
