import type { PluginUtils } from "./vendor/playground";
import type { Sandbox } from "./vendor/sandbox";
import { SyncState, userSyncInfo } from "./syncUp";
import type {editor} from "monaco-editor"
import { HubConnection } from "@aspnet/signalr";

export const showRoomStatus = (
  config: { container: HTMLElement, baseURL: string, room: string, myName: string,  connection: HubConnection, sandbox: Sandbox }, 
  utils: PluginUtils
) => {

  let userStates = new Map<string, SyncState & { index: number }>()

  const contentContainer = config.container;
  const outer = utils.createDesignSystem(contentContainer);

  const existingQuery = window.location.search.length ?  window.location.search : "?share=1"
  const shareLink = `${window.location.origin}${window.location.pathname}${existingQuery}&join-room=${config.room}&install-plugin=playground-collaborate`
  outer.subtitle(`Room: <code>${config.room}</code> - <a href='${shareLink}'>invite</a>`);

  const names = document.createElement("div");
  contentContainer.appendChild(names)

  let decorations: string[] = []

  const updateUI = () => {
    const ds = utils.createDesignSystem(names);
    ds.clear()

    const newDecorators = []
    const requestedAccess: SyncState[] = []

    // Loop through each possible user state to generate info
    userStates.forEach(state => {
      if (state.lastRequestedWriteAccessTime) requestedAccess.push(state)

      // No need to show our own decorations
      if (state.sender === config.myName) return

      const decoration: editor.IModelDeltaDecoration = {
        range: new config.sandbox.monaco.Range(state.selection.startLine, state.selection.startCol, state.selection.endLine, state.selection.endCol),
        options: { className: `collab co-sel-${state.index}` },
      }
      newDecorators.push(decoration)
    })

    // Determine who was the last person to ask for write access
    const lastRequestedAccess = requestedAccess.sort((l, r) => r.lastRequestedWriteAccessTime.localeCompare(l.lastRequestedWriteAccessTime))[0]
    const iHaveWriteAccess = lastRequestedAccess && config.myName === lastRequestedAccess.sender
    const oldWriteAccess = config.sandbox.editor.getOptions().get(/*EditorOption.readOnly*/ 65)

    userStates.forEach(state => {
      const author = lastRequestedAccess &&  state.sender === lastRequestedAccess.sender ? " (author)" : ""
      ds.p(`<span class='co-sel-${state.index}'>> ${state.sender}</span>${author}`)
    })


    // Set read/write access 
    config.sandbox.editor.updateOptions({ readOnly: !iHaveWriteAccess })
    
    // Sync the text, and make sure the selected position stays
    if (!iHaveWriteAccess && lastRequestedAccess && lastRequestedAccess.text) {
      const oldPos = config.sandbox.editor.getSelection()
      config.sandbox.setText(lastRequestedAccess.text)
      config.sandbox.editor.setSelection(oldPos)
    }

    const buttons = ["compiler-options-button", "examples-button", "whatisnew-button"]
    buttons.forEach(id => document.getElementById(id).style.opacity = iHaveWriteAccess? "1": "0.2");

    // Show the state
    if (iHaveWriteAccess) {
      ds.p("You have write access")
      // If you've just got write access, then focus the editor
      if (!oldWriteAccess) config.sandbox.editor.focus()

    } else {
      ds.p("You are in readonly mode")
        const button = document.createElement("input");
        button.type = "button";
        button.value = "Become the author";
        button.onclick = () => {
          userSyncInfo.lastRequestedWriteAccessTime = new Date().toISOString()
          button.value = "Requesting..."

        };
        names.appendChild(button);
    }

    decorations = config.sandbox.editor.deltaDecorations(decorations, newDecorators)
  }

  config.connection.on("newMessage", (msg) => {
    console.log("new message", msg)
    if (!msg.selection) return
    if (msg.room !== config.room) return
    
    const index = userStates.get(msg.sender) && userStates.get(msg.sender
      ).index || userStates.size
    msg.index = index

    userStates.set(msg.sender, msg)
    
    removeOldUserStates(userStates)
    updateUI()
  })
}

const removeOldUserStates = (map: Map<string, SyncState>) => {
  const toRemove =[]
  const now = new Date()
  
  map.forEach((value, key) => {
    const lastSyncDate = new Date(value.lastSent)
    const tenSeconds = 1000 * 10
    if (lastSyncDate.valueOf() + tenSeconds < now.valueOf()) {
      toRemove.push(key)
    }
  })

  toRemove.forEach(r => map.delete(r))
}
