import { AzureFunction, Context, HttpRequest } from "@azure/functions";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  const group = req.body.group
  
  let userId = ""
  if (req.headers && req.headers['x-ms-client-principal-id']) {
    userId = req.headers['x-ms-client-principal-id'];
  }

  context.bindings.signalRGroupActions = [{
    userId,
    groupName: group,
    action: "add",
  }];
};

export default httpTrigger;
