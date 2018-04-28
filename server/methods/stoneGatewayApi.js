import SimpleSchema from "simpl-schema";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { registerSchema } from "@reactioncommerce/schemas";

// API para conexão com os servidores da Stone
const StoneGatewayRestfulAPI = {
  authorize(transactionType, cardData, paymentData) {
    if (transactionType === "authorize") {

      // Fazer a requisição via HTTP/POST
      var xhr = new XMLHttpRequest();
      var url = "https://transaction.stone.com.br/Sale/";

      var headers = {
        "MerchantKey": "f2a1f485-cfd4-49f5-8862-0ebc438ae923", // MerchantKey de teste
        "Content-Type": "application/json",
        "Accept": "application/json"
      };
      
      xhr.open("POST", url, true);
      xhr.setRequestHeader(headers);

      // Converte o valor da compra para centavos
      var totalInCents = +paymentData.total * 100;
      var AmountInCents = totalInCents;

      // Dados em JSON que serão enviados para API RESTful
      var data = JSON.stringify(
        {
          "CreditCardTransactionCollection": [
              {
                  "AmountInCents": AmountInCents,
                  "CreditCard": {
                      "CreditCardBrand": cardData.type,
                      "CreditCardNumber": cardData.number,
                      "ExpMonth": +cardData.expireMonth,
                      "ExpYear": +cardData.expireYear,
                      "HolderName": cardData.name,
                      "SecurityCode": cardData.cvv2
                  },
                  "CreditCardOperation":"AuthOnly",
                  "InstallmentCount": +paymentData.installmentCount
              }
          ]
        }
      );

      xhr.send(data);

      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
          var json = JSON.parse(xhr.responseText);
          console.log(json);
          const results = {
            success: true,
            id: json.OrderKey,
            cardType: json.CreditCardTransactionResultCollection.CreditCard.CreditCardBrand,
            cardNumber: json.CreditCardTransactionResultCollection.CreditCard.MaskedCreditCardNumber,
            authorizationId: json.OrderKey,
            amount: json.CreditCardTransactionResultCollection.AmountInCents,
            currency: "BRL"
          };
          return results;
        }
        if (xhr.readyState === 4 && xhr.status === 400) {
          var json = JSON.parse(xhr.responseText);
          console.log(json);
          const results = {
            success: false
          };
          return results;
        }
      };
    };
  },
  capture(authorizationId) {
      // Fazer a requisição via HTTP/POST
      var xhr = new XMLHttpRequest();
      var url = "https://transaction.stone.com.br/Sale/Capture";

      var headers = {
        "MerchantKey": "f2a1f485-cfd4-49f5-8862-0ebc438ae923", // MerchantKey de teste
        "Content-Type": "application/json",
        "Accept": "application/json"
      };
      
      xhr.open("POST", url, true);
      xhr.setRequestHeader(headers);

      // Dados em JSON que serão enviados para API RESTful
      var data = JSON.stringify({ "OrderKey":authorizationId });

      xhr.send(data);

      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
          var json = JSON.parse(xhr.responseText);
          console.log(json);
          const results = {
            success: true,
            transactionId: json.CreditCardTransactionResultCollection.TransactionKey,
            amount: json.CreditCardTransactionResultCollection.AmountInCents,
            currency: "BRL"
          };
          return results;
        }
        if (xhr.readyState === 4 && xhr.status === 400) {
          var json = JSON.parse(xhr.responseText);
          console.log(json);
          const results = {
            success: false
          };
          return results;
        }
      };
  },
  refund(authorizationId) {
      // Fazer a requisição via HTTP/POST
      var xhr = new XMLHttpRequest();
      var url = "https://transaction.stone.com.br/Sale/Cancel";

      var headers = {
        "MerchantKey": "f2a1f485-cfd4-49f5-8862-0ebc438ae923", // MerchantKey de teste
        "Content-Type": "application/json",
        "Accept": "application/json"
      };
      
      xhr.open("POST", url, true);
      xhr.setRequestHeader(headers);

      // Dados em JSON que serão enviados para API RESTful
      var data = JSON.stringify({ "OrderKey":authorizationId });

      xhr.send(data);

      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
          var json = JSON.parse(xhr.responseText);
          console.log(json);
          const results = {
            success: true,
            status: json.CreditCardTransactionResultCollection.CreditCardTransactionStatus,
            transactionId: json.CreditCardTransactionResultCollection.TransactionKey,
            amount: json.CreditCardTransactionResultCollection.AmountInCents,
            currency: "BRL"
          };
          return results;
        }
        if (xhr.readyState === 4 && xhr.status === 400) {
          var json = JSON.parse(xhr.responseText);
          console.log(json);
          const results = {
            success: false
          };
          return results;
        }
      };
  },
  listRefunds(authorizationId) {

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState == XMLHttpRequest.DONE) {
        alert(xhr.responseText);
      }
    }
    xhr.open('GET', 'https://transaction.stone.com.br/Sale/Query/OrderKey='+authorizationId, true);
    xhr.send(null);

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        var json = JSON.parse(xhr.responseText);
        console.log(json);
        const results = {
          success: true,
          type: "refund",
          status: json.CreditCardTransactionResultCollection.CreditCardTransactionStatus,
          transactionId: json.CreditCardTransactionResultCollection.TransactionKey,
          amount: json.CreditCardTransactionResultCollection.AmountInCents,
          currency: "BRL",
          raw: {json}
        };
        return results;
      }
      if (xhr.readyState === 4 && xhr.status === 400) {
        var json = JSON.parse(xhr.responseText);
        console.log(json);
        const results = {
          success: false
        };
        return results;
      }
    };
  }
};


// Métodos para chamar a API
export const StoneGatewayApi = {};
StoneGatewayApi.methods = {};

// Dados da transação
export const cardSchema = new SimpleSchema({
  number: String,
  name: String,
  cvv2: String,
  expireMonth: String,
  expireYear: String,
  type: String,
  documentNumber: String,
  documentType: String
});

registerSchema("cardSchema", cardSchema);

export const paymentDataSchema = new SimpleSchema({
  total: String,
  installmentCount: String,
  currency: String
});

registerSchema("paymentDataSchema", paymentDataSchema);

// Método de autorização
StoneGatewayApi.methods.authorize = new ValidatedMethod({
  name: "StoneGatewayApi.methods.authorize",
  validate: new SimpleSchema({
    transactionType: String,
    cardData: { type: cardSchema },
    paymentData: { type: paymentDataSchema }
  }).validator(),
  run({ transactionType, cardData, paymentData }) {
    const results = StoneGatewayRestfulAPI.authorize(transactionType, cardData, paymentData);
    return results;
  }
});

// Método de captura
StoneGatewayApi.methods.capture = new ValidatedMethod({
  name: "StoneGatewayApi.methods.capture",
  validate: new SimpleSchema({
    authorizationId: String,
    amount: Number
  }).validator(),
  run(args) {
    const transactionId = args.authorizationId;
    const { amount } = args;
    const results = StoneGatewayRestfulAPI.capture(transactionId, amount);
    return results;
  }
});

// Método de estorno ou cancelamento
StoneGatewayApi.methods.refund = new ValidatedMethod({
  name: "StoneGatewayApi.methods.refund",
  validate: new SimpleSchema({
    transactionId: String,
    amount: Number
  }).validator(),
  run(args) {
    const { transactionId, amount } = args.transactionId;
    const results = StoneGatewayRestfulAPI.refund(transactionId, amount);
    return results;
  }
});

// Método de requisição do status da transação
StoneGatewayApi.methods.refunds = new ValidatedMethod({
  name: "StoneGatewayApi.methods.refunds",
  validate: new SimpleSchema({
    transactionId: String
  }).validator(),
  run(args) {
    const { transactionId } = args;
    const results = StoneGatewayRestfulAPI.listRefunds(transactionId);
    return results;
  }
});
