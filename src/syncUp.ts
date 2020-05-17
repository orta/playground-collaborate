import { Sandbox } from "./vendor/sandbox";
import { HubConnection } from "@aspnet/signalr";

// TODO: This needs a timeout somehow

export type SyncState = {
  group: string,
  sender: string,
  selection: {
    startLine: number,
    startCol: number,
    endLine: number,
    endCol: number
  }
}

let timer: NodeJS.Timer = undefined
let lastSentResponse = {}

export const startSyncing = (config: { baseURL: string, room: string, sender: string, sandbox: Sandbox }, connection: HubConnection) => {
  timer = setInterval(() => {
    try {
      const selection = config.sandbox.editor.getSelection()
      const body: SyncState = {
        group: config.room,
        sender: config.sender,
        selection: {
          startLine: selection.startLineNumber,
          startCol: selection.startColumn,
          endLine: selection.endLineNumber,
          endCol: selection.endColumn
        }
      }
      
      if (lastSentResponse === body) return
      lastSentResponse = body

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
