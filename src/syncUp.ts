import { Sandbox } from "./vendor/sandbox";
import { HubConnection } from "@aspnet/signalr";

// TODO: This needs a timeout somehow

export type SyncState = {
  /** This ignores the SignalR rooms completley 
   */
  room: string,
  /** User name of who sent it  */
  sender: string,
  /** Monaco selection state */
  selection: {
    startLine: number,
    startCol: number,
    endLine: number,
    endCol: number
  }
  /** Used to determine who asked for permission last  */
  lastRequestedWriteAccessTime: null | string
  /** Text of TS/JS  */
  text: null | string,
  /** Date.now for when the last message was sent  */
  lastSent: string
}

let timer: NodeJS.Timer = undefined
let lastSentResponse = {}

/** A global which others can mess with to set sync state info */
export let userSyncInfo = {
  lastRequestedWriteAccessTime: null
}

export const startSyncing = (config: { baseURL: string, room: string, sender: string, sandbox: Sandbox }, connection: HubConnection) => {
  timer = setInterval(() => {
    try {
      const selection = config.sandbox.editor.getSelection()
      const  hasWriteAccess = userSyncInfo.lastRequestedWriteAccessTime !== null
      const textToSend = hasWriteAccess ? config.sandbox.getText() : null
      const body: SyncState = {
        room: config.room,
        sender: config.sender,
        selection: {
          startLine: selection.startLineNumber,
          startCol: selection.startColumn,
          endLine: selection.endLineNumber,
          endCol: selection.endColumn
        },
        lastRequestedWriteAccessTime: userSyncInfo.lastRequestedWriteAccessTime,
        text: textToSend,
        lastSent: new Date().toISOString()
      }
      
      // Don't send dupes
      const withoutLastSent = {...body, lastSent: undefined }
      if (JSON.stringify(withoutLastSent) === JSON.stringify(lastSentResponse)) return
      lastSentResponse = withoutLastSent

      console.log("Sending update")
      fetch(`${config.baseURL}/api/update`, { method: "POST", credentials: "include", body: JSON.stringify(body) }).then(r => {
        if (r.ok) {
          // console.log("Updated", r);
          // r.text().then(rs => console.log(rs))
        } else {
          console.error("Update failed", r)
        }
      })
        // connection.send("newMessage", "asdasd", "Asdasd")
    } catch (error) {
      console.log("Could not send update", error);
      return undefined;
    }
  }, 3000)
}


export const stopSyncing = () => {
  timer && clearTimeout(timer)
}
