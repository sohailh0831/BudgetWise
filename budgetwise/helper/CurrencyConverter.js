const convertCurrency = require('nodejs-currency-converter');
const request = require('request');
const _ = require('lodash');


function convert(base, to) {
  if (base === 'EUR') {
    return new Promise(function(resolve, reject) {
       request({
            url: `http://data.fixer.io/api/latest?access_key=f434557b146d418db96f8949f9878a85&base=${base}&symbols=${to}`,
            json: true
          }, function (error, response, body) {
            if (error) {
              reject(error);
            } else {
              resolve(body.rates[`${to}`]);
            }
        });
     });
  } else {
    return new Promise(function(resolve, reject) {
       request({
            url: `http://data.fixer.io/api/latest?access_key=f434557b146d418db96f8949f9878a85&base=EUR&symbols=${base}`,
            json: true
          }, function (errorBase, responseBase, bodyBase) {
            if (errorBase) {
              reject(errorBase);
            } else {
              let baseValue = bodyBase.rates[`${base}`];
              request({
                url: `http://data.fixer.io/api/latest?access_key=f434557b146d418db96f8949f9878a85&base=EUR&symbols=${to}`,
                json: true
              }, function (errorTo, responseTo, bodyTo) {
                if (errorTo) {
                  reject(errorTo);
                } else {
                  let toValue = bodyTo.rates[`${to}`];
                  resolve(toValue/baseValue);
                }
              });
            }
        });
     });
  }
}

// convert('EUR', 'USD')
//               .then(value => {
//   console.log('USD: ' + value);
// }).catch(error=>{console.log(error)})
// convert('USD', 'AUD')
//               .then(value => {
//   console.log('USD TO AUD: ' + value);
// }).catch(error=>{console.log(error)})


module.exports = {
  convert,
}