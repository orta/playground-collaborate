import { Sandbox } from "./vendor/sandbox";

let timer: NodeJS.Timer = undefined
export const startSyncing = (config: { baseURL: string, room: string, sandbox: Sandbox }) => {
  timer = setInterval(() => {
    try {
      const selection = config.sandbox.editor.getSelection()
      const body = {
        group: config.room,
        selection: {
          startLine: selection.startLineNumber,
          startCol: selection.startColumn,
          endLine: selection.endLineNumber,
          endCol: selection.endColumn
        }
      }
      fetch(`${config.baseURL}/api/update`, { method: "POST", credentials: "include", body: JSON.stringify(body) }).then(r => {
        if(r.ok) {
          // console.log("Updated", r);
        } else {
          console.error("Update failed", r)
        }
      })
    } catch (error) {
      console.log("Could not send update", error);
      return undefined;
    }
  }, 1000)
}


export const stopSyncing = () => {
  timer && clearTimeout(timer)
}
