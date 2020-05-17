import { AzureFunction, Context, HttpRequest } from "@azure/functions";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  const group = req.body.group
  console.log(req.query)
  context.bindings.signalRGroupActions = [{
    userId: req.query.userId,
    groupName: group,
    action: "add",
  }];
};

export default httpTrigger;
