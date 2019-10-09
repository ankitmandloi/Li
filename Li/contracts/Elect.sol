pragma solidity ^0.4.18;

contract Elect {

  struct Candidate{
    uint id;
    address candidate;
    address voter;
    string name;
    string description;
    uint256 value;
  }

mapping (uint =>Candidate) public candidates;
uint candidateCounter;



  event LogRequests(
    uint indexed _id,
    address indexed _candidate,
    string _name,
    uint256 _value
    );

function voteRequest(string _name,string _description,uint256  _value) public {

candidateCounter++;

candidates[candidateCounter] = Candidate(
  candidateCounter,
  msg.sender,
  0x0,
  _name,
  _description,
  _value
  );

LogRequests(candidateCounter,msg.sender,_description,_value);

}

function getNumberOfCandidates() public view returns(uint){
return  candidateCounter;
}

function getCandidatesRequesting() public view returns(uint[]){
  uint[] memory candidateIds = new uint[](candidateCounter);
  uint numberOfCandidates=0;

  for(uint i=1;i<=candidateCounter;i++){
    if(candidates[i].voter==0x0){
      candidateIds[numberOfCandidates]=candidates[i].id;
      numberOfCandidates++;
    }
  }
  //candiadateIds array  =>  requesting array
  uint[] memory requesting=new uint[] (numberOfCandidates);
  for(uint j=0; j<numberOfCandidates;j++){
    requesting[j]=candidateIds[j];

  }
  return requesting;
}

  function voteFor(uint _id) payable public {
  require(candidateCounter>0);

  require(_id>0 && _id<=candidateCounter);

  Candidate storage cand = candidates[_id];

//  require(voter == 0X0);
//  require(msg.sender != candidate);
  require(msg.value == cand.value);

  cand.voter = msg.sender;

  cand.candidate.transfer(msg.value);
}
}
