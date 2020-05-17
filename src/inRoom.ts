import type { PluginUtils } from "./vendor/playground";
import type { Sandbox } from "./vendor/sandbox";
import type { SyncState } from "./syncUp";
import type {editor} from "monaco-editor"
import { HubConnection } from "@aspnet/signalr";



export const showRoomStatus = (
  config: { baseURL: string, room: string, myName: string,  connection: HubConnection, sandbox: Sandbox }, 
  utils: PluginUtils
) => {

  let userStates = new Map<string, SyncState & { index: number }>()

  const contentContainer = document.createElement("div");
  const outer = utils.createDesignSystem(contentContainer);

  const shareLink = `${window.location.href}?join-room=${config.room}&install-plugin=playground-collaborate`
  outer.subtitle(`Room: <code>${config.room}</code> - <a href='${shareLink}'>invite</a>`);


  const names = document.createElement("div");
  contentContainer.appendChild(names)

  let decorations: string[] = []
  let decorationLock = false

  const updateUI = () => {
    console.log("UI")
    const ds = utils.createDesignSystem(names);
    ds.clear()

    const newDecorators = []
    userStates.forEach(state => {
      ds.p("> " + state.sender)

      // No need to show our own decorations
      if (state.sender === config.myName) return

      const decoration: editor.IModelDeltaDecoration = {
        range: new config.sandbox.monaco.Range(state.selection.startLine, state.selection.startCol, state.selection.endLine, state.selection.endCol),
        options: { className: `collab selection-${state.index}` },
      }
      newDecorators.push(decoration)
    })

    decorations = config.sandbox.editor.deltaDecorations(decorations, newDecorators)
  }

  config.connection.on("newMessage", (msg) => {
    console.log(msg);
    
    if (!msg.selection) return
    if (msg.group !== config.room) return
    
    const index = userStates.get(msg.sender) && userStates.get(msg.sender).index || userStates.size
    msg.index = index

    userStates.set(msg.sender, msg)
    updateUI()
  })

  return contentContainer
}
