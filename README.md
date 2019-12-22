# Supreme Monitor

## How it works?
- Monitors [Supreme](https://www.supremenewyork.com/) for any stock updates
- Will send a notification to the specified Discord webhook when a new product or restock is detected
- The notification will include the product title, image and direct link
## How to setup?
1. Open command line and move to the supreme-monitor directory. This can be done by with the `cd` command followed by the folders directory 
**eg.** `cd users/name/supreme-monitor`

2. Download the scripts dependencies with `npm install` 
3. Edit the config.json, adding your own Discord webhook, group name and the monitor delay
4. Run the script using `node .` You will see the scripts database fill in with all of the current products available (that means it's working!)
