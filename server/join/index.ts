import { AzureFunction, Context, HttpRequest } from "@azure/functions";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest) {
  const group = req.body.group
  
  let userId = ""
  if (req.headers && req.headers['x-ms-client-principal-id']) {
    userId = req.headers['x-ms-client-principal-id'];
  }

  return {
    userId,
    groupName: group,
    action: "add",
  };
};

export default httpTrigger;
