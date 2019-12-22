//import required moduled
var request = require('request');
const webhook = require('webhook-discord');
const config = require("./config.json");
const Hook = new webhook.Webhook(config.webhook);

//headers to pass supreme during requests
var headers = {
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36',
    'accept': 'text/json'
};

var stock_options = {
    url: 'https://www.supremenewyork.com/mobile_stock.json',
    headers: headers
};

var data = [];

//gets entire new product stock
function get_stock() {
    request(stock_options, (error, response, stock) => {
        if (!error && response.statusCode == 200) {
            var new_products = JSON.parse(stock)["products_and_categories"]["new"];
            for (var product = 0; product < new_products.length; product++) {

                var product_options = {
                    url: 'https://www.supremenewyork.com/shop/' + new_products[product]["id"] + '.json',
                    headers: headers
                };
    
                //if the product doesn't currently exist in our data
                if (!data.find((item) => item.id == new_products[product]["id"])) {

                    data.push({"id": new_products[product]["id"], "name": new_products[product]["name"], "image_url": new_products[product]["image_url"], "styles": []})

                    const msg = new webhook.MessageBuilder()
                        .setName("Just loaded!")
                        .setColor("#00FF00")
                        .setTitle("**" + new_products[product]["name"] + " just dropped! WOAH!**")
                        .addField("Product link", 'https://www.supremenewyork.com/shop/' + new_products[product]["id"])
                        .setImage("https:" + new_products[product]["image_url"])
                        .setFooter(config.group_name)
                        .setTime();
        
                    Hook.send(msg);
                    
                    get_new_product(new_products[product]["id"], product_options)
                }
                else {
                    get_product(new_products[product]["id"], product_options)
                }
            }
        }
    });
}

//gets data regarding specific product
function get_product(product_id, product_options) {
    request(product_options,  (error, response, product) => {
        if (!error && response.statusCode == 200) {
            var product_styles = JSON.parse(product)["styles"];
    
            check_restock(product_styles, product_id);
        }
    });
}

//gets data regarding specific product
function get_new_product(product_id, product_options) {
    request(product_options,  (error, response, product) => {
        if (!error && response.statusCode == 200) {
            var product_styles = JSON.parse(product)["styles"];
    
            for (var style = 0; style < product_styles.length; style++) {

                var item_index = data.findIndex((item) => item.id == product_id);
                data[item_index]["styles"].push({"id": product_styles[style]["id"], "name": product_styles[style]["name"], "sizes": []});

                var style_id = product_styles[style]["id"];

                var style_index = data[item_index]["styles"].findIndex((style) => style.id == style_id);
                    
                for (var size = 0; size < product_styles[style]["sizes"].length; size++) {
                    data[item_index]["styles"][style_index]["sizes"].push({"id": product_styles[style]["sizes"][size]["id"], "name": product_styles[style]["sizes"][size]["name"], "stock_level": product_styles[style]["sizes"][size]["stock_level"]});
                }
            }
            check_restock(product_styles, product_id);
        }
    });
}

function check_restock(product_styles, product_id) {
    for (var style = 0; style < product_styles.length; style++) {
        for (var size = 0; size < product_styles[style]["sizes"].length; size++) {

            var item_index = data.findIndex((item) => item.id == product_id);
            var style_id = product_styles[style]["id"];
            var style_index = data[item_index]["styles"].findIndex((style) => style.id == style_id);

            var supreme_stock_level = product_styles[style]["sizes"][size]["stock_level"];
            var local_stock_level = data[item_index]["styles"][style_index]["sizes"][size]["stock_level"];

            if (supreme_stock_level == 1 && local_stock_level == 0) {
                data[item_index]["styles"][style_index]["sizes"][size]["stock_level"] = 1;

                const msg = new webhook.MessageBuilder()
                    .setName("Restock!")
                    .setColor("#FF0000")
                    .setTitle(data[item_index]["name"] + " in " + data[item_index]["styles"][style_index]["name"] + " size " + data[item_index]["styles"][style_index]["sizes"][size]["name"] + " just restocked!!!")
                    .addField("Product link", 'https://www.supremenewyork.com/shop/' + product_id)
                    .setImage("https:" + data[item_index]["image_url"])
                    .setFooter(config.group_name)
                    .setTime();

                Hook.send(msg);
            }
            else if (supreme_stock_level == 0 && local_stock_level == 1) {
                data[item_index]["styles"][style_index]["sizes"][size]["stock_level"] = 0;
            }
        }
    }
}


let t;
let interval = setInterval(
    (t = () => {
        get_stock();
    }), 5000
);
t();
