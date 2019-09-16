//import required moduled
var request = require('request');

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

function product_callback(error, response, product) {
    if (!error && response.statusCode == 200) {
        var styles = JSON.parse(product)["styles"];

        for (var style = 0; style < styles.length; style++) {

        }
    }
}

function stock_callback(error, response, stock) {
    if (!error && response.statusCode == 200) {
        var new_products = JSON.parse(stock)["products_and_categories"]["new"];
        for (var product = 0; product < new_products.length; product++) {

            //if the product doesn't currently exist in our data
            if (!data.find((item) => item.id == new_products[product]["id"])) {
                data.push({"id": new_products[product]["id"], "name": new_products[product]["name"], "styles": []})
            }

            var product_options = {
                url: 'https://www.supremenewyork.com/shop/' + new_products[product]["id"] + '.json',
                headers: headers
            };

            request(product_options, product_callback);
        }
    }
}

request(stock_options, stock_callback);
