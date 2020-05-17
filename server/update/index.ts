import { AzureFunction, Context, HttpRequest } from "@azure/functions"

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest) {
    return {
        "groupName": req.body.group,
        "target": "update",
        "arguments": [ req.body ]
      };
};

export default httpTrigger;
