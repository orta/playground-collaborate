import { AzureFunction, Context, HttpRequest } from "@azure/functions";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest) {
  const message = req.body;

  if (req.headers && req.headers["x-ms-client-principal-name"]) {
    message.sender = req.headers["x-ms-client-principal-name"];
  }

  return {
    groupName: req.body.group,
    target: "update",
    arguments: [message],
  };
};

export default httpTrigger;
