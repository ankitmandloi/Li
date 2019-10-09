var EAC = require('@ethereum-alarm-clock/lib').EAC;
const Util = require('@ethereum-alarm-clock/lib').Util;

const moment = require('moment.js');
const web3 = Util.getWeb3FromProviderUrl('ws://localhost:7545');
const eac = new EAC(web3);
//const web3 = new Web3(App.web3Provider);


App = {

  web3Provider: null,
  contracts: {},
  account: 0x0,
  loading: false,

  init: function () {
    return App.initWeb3();
  },

  initWeb3: function () {
    if (typeof web3 !== "undefined") {
      App.web3Provider = web3.currentProvider;
    } else {
      App.web3Provider = new Web3.providers.HttpProvider(
        "http://localhost:7545"
      );
    }

    web3 = new Web3(App.web3Provider);

    App.displayAccountInfo();

    return App.initContract();
  },





  emiSchedular: function () {

    var _candidateId = $(".btn-vote").attr("data-id");
    var _value = $(".btn-vote").attr("data-value");
  }
  ,
  scheduleTransaction: async function () {

    const receipt = await eac.schedule({
      toAddress: '0xe87529A6123a74320e13A6Dabf3606630683C029',
      callValue: 10,
      windowStart: moment().add('1', 'day').unix()
    });

    const scheduledTx = eac.transactionRequestFromReceipt(receipt);

    await scheduledTx.fillData();

    console.log(`
  Address of scheduled EMI is: ${scheduledTx.address}
  Next Installment is scheduled for: ${moment.unix(scheduledTx.windowStart.toNumber()).format()}
  `);
  }
  ,
  displayAccountInfo: function () {
    web3.eth.getCoinbase(function (err, account) {
      if (err === null) {
        App.account = account;
        $("#account").text(account);
        web3.eth.getBalance(account, function (err, balance) {
          if (err == null) {
            $("#accountBalance").text(web3.fromWei(balance, "ether") + " ETH");
          }
        });
      }
    });
  },

  initContract: function () {
    $.getJSON("Elect.json", function (electArtifact) {
      App.contracts.Elect = TruffleContract(electArtifact);

      App.contracts.Elect.setProvider(App.web3Provider);

      App.listenToEvents();

      return App.reloadInfo();
    });
  },

  reloadInfo: function () {
    if (App.loading) {
      return;
    }
    App.loading = true;

    App.displayAccountInfo();

    var electInstance;

    App.contracts.Elect.deployed()
      .then(function (instance) {
        electInstance = instance;
        return electInstance.getCandidatesRequesting();
      })
      .then(function (candidateIds) {
        //    $('#voteRequest').empty();
        for (var i = 0; i < candidateIds.length; i++) {
          var candidateId = candidateIds[i];
          electInstance
            .candidates(candidateId.toNumber())
            .then(function (candidate) {
              App.displayCandidate(
                candidate[0],
                candidate[1],
                candidate[3],
                candidate[4],
                candidate[5]
              );
              //alert(candidate[5]);
            });
        }
        App.loading = false;
      })
      .catch(function (err) {
        console.log(err);
        App.loading = false;
      });
  },
  displayCandidate: function (id, candidate, name, description, value) {
    var voteRequest = $("#voteRequest");
    var etherPrice = web3.toWei(value, "ether");

    //  var etherPrice=etp/100000;
    //if (candidate !== App.account || App.account !== a) {
    //     console.log("Hfhdhthdhbbdbh");
    //   document.getElementById("requestTemplate").style.display = "none";
    // $("#requestTemplate").hide();
    //}//

    var requestTemplate = $("#requestTemplate");
    requestTemplate.find(".panel-title").text(name);
    requestTemplate.find(".request-description").text(description);
    requestTemplate.find(".request-value").text(etherPrice + "ETH");
    requestTemplate.find(".btn-vote").attr("data-id", id);
    requestTemplate.find(".btn-vote").attr("data-value", etherPrice);
    var a = "0xd54cf8b8ca65ad6fbe786f71e435b9e37523fd12";
    var b = App.account;

    if (App.account !== a) {
      requestTemplate.find(".request_id").text("You");
      requestTemplate.find(".btn-vote").hide();
    } else {
      requestTemplate.find(".request_id").text(candidate);
      requestTemplate.find(".btn-vote").show();
    }

    voteRequest.append(requestTemplate.html());
  },

  voteRequest: function () {
    var _candidate_name = $("#candidate_name").val();
    var _candidate_description = $("#candidate_description").val();
    var _candidate_value = web3.toWei(
      parseFloat($("#candidate_value").val() || 0),
      "ether"
    );

    if (_candidate_name.trim() == "" || _candidate_value == 0) {
      return false;
    }

    App.contracts.Elect.deployed()
      .then(function (instance) {
        return instance.voteRequest(
          _candidate_name,
          _candidate_description,
          _candidate_value,
          {
            from: App.account,

            gas: 500000
          }
        );
      })
      .then(function (result) { })
      .catch(function (err) {
        console.error(err);
      });
  },
  listenToEvents: function () {
    App.contracts.Elect.deployed().then(function (instance) {
      instance.LogRequests({}, {}).watch(function (error, event) {
        if (!error) {
          $("#events").append(
            '<li class="list-group-item">' +
            event.args._candidate_value +
            "is now for voting </li>"
          );
        } else {
          console.log("Hello");
        }
        App.reloadInfo();
      });
    });
  },

  voteFor: function () {
    event.preventDefault();

    var _candidateId = $(".btn-vote").attr("data-id");

    var _value = $(".btn-vote").attr("data-value");

    App.contracts.Elect.deployed()
      .then(function (instance) {
        return instance.voteFor(_candidateId, {
          from: App.account,
          value: web3.fromWei(_value, "ether"),
          gas: 500000
        });
      })
      .catch(function (error) {
        console.error(error);
      });
  }
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
