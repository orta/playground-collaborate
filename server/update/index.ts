import { AzureFunction, Context, HttpRequest } from "@azure/functions";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest) {
  const message = req.body;

  return {
    target: "newMessage",
    arguments: [message],
  };
};

export default httpTrigger;

