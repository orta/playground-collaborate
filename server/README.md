## The server for the Playground Collab

This is a super-low code repo, which means you need to learn a bunch of abstractions before you can be useful.

### If you're not familiar with node + signalr

Read these to understand the code in the functions:
 - https://docs.microsoft.com/en-us/azure/azure-signalr/signalr-quickstart-azure-functions-javascript
 - https://docs.microsoft.com/en-us/azure/azure-signalr/signalr-tutorial-authenticate-azure-functions

The functions then act on signalr input/output bindings in Azure, to understand those:
 - https://docs.microsoft.com/en-us/azure/azure-functions/functions-bindings-signalr-service-input?tabs=javascript
 - https://docs.microsoft.com/en-us/azure/azure-functions/functions-bindings-signalr-service-output?tabs=javascript

Now you probably know enough to 

### Azure stuff

- [Function App](https://ms.portal.azure.com/#@microsoft.onmicrosoft.com/resource/subscriptions/57bfeeed-c34a-4ffd-a06b-ccff27ac91b8/resourceGroups/playgroundcollab/providers/Microsoft.Web/sites/PlaygroundCollab/appServices)
- [App used in Oauth](https://ms.portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/Overview/appId/f5699f1d-02fe-4a10-8ffc-efd248bf6cce/objectId/df868557-1324-4e30-9303-cee562caa6f7/isMSAApp//defaultBlade/Overview/appSignInAudience/AzureADandPersonalMicrosoftAccount/servicePrincipalCreated/true)
