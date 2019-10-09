const { EAC, Util } = require('@ethereum-alarm-clock/lib');
const moment = require('moment');
const web3 = Util.getWeb3FromProviderUrl('ws://localhost:7545');
const eac = new EAC(web3);



function emiSchedular() {

  var _candidateId = $(".btn-vote").attr("data-id");
  var _value = $(".btn-vote").attr("data-value");
}

async function scheduleTransaction() {
  const receipt = await eac.schedule({
    toAddress: '0xe87529A6123a74320e13A6Dabf3606630683C029',
    callValue: 10,
    windowStart: moment().add('1', 'day').unix() // 1 day from now
  });

  const scheduledTx = eac.transactionRequestFromReceipt(receipt);

  await scheduledTx.fillData();

  console.log(`
  Address of scheduled EMI is: ${scheduledTx.address}
  Next Installment is scheduled for: ${moment.unix(scheduledTx.windowStart.toNumber()).format()}
  `);
}