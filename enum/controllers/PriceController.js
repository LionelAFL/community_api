const db = require("../models");
const HttpCodes = require("http-codes");
const axios = require('axios');

const headers = {
    'Content-Type': 'application/json',
    'X-API-KEY': 'BQYUv333aLHXBM5cKxRQklczyDJt7t9Z',
  };
  
const PriceController = () => {
  /**
   * Method to get ethereum price objects
   * @param {*} req
   * @param {*} res
   */
  const getPrice = async (req, res) => {
    const token1 = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
    const token0 = "0xdac17f958d2ee523a2206206994597c13d831ec7";
    const lookBack = 50;
    try {
        const jsonData = {
            query: `
              query GetDexTrades($first: Int, $token0: String!, $token1: String!, $date: ISO8601DateTime!) {
                ethereum(network: ethereum) {
                  dexTrades(
                    options: { limit: $first, desc: "timeInterval.minute" }
                    baseCurrency: { is: $token1 }
                    quoteCurrency: { is: $token0 }
                  ) {
                    timeInterval {
                      minute(format: "%FT%TZ", count: 60)
                    }
                    volume: quoteAmount
                    high: quotePrice(calculate: maximum)
                    low: quotePrice(calculate: minimum)
                    open: minimum(of: block, get: quote_price)
                    close: maximum(of: block, get: quote_price)
                  }
                }
              }
            `,
            variables: {
              first: lookBack,
              token0: token0.toLowerCase(),
              token1: token1.toLowerCase(),
            },
            operationName: 'GetDexTrades',
          };
      const response = await axios.post('https://graphql.bitquery.io/', jsonData, { headers: headers });
      const responseData = response.data.data.ethereum.dexTrades;
  
      const returnData = responseData.map((data) => {
        return {
          time: data.timeInterval.minute,
          price: parseFloat(data.high),
        };
      });
  
      const reversedData = returnData.reverse();
      console.log(reversedData);
      if (!reversedData) {
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }

      return res.status(HttpCodes.OK).json(reversedData);
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  return {
    getPrice,
  };
};

module.exports = PriceController;
