"use strict";

const ACTIONS = ["B", "C"]; // bet/call vs check/fold
const KUHN_CARDS = ["J", "Q", "K"];

const LOG = true;

const NUM_ACTIONS = ACTIONS.length;
const NUM_CARDS = KUHN_CARDS.length;

// each information set is represented by an inner class Node.
// each node has fields corresponding to the regret and strategy variable definitions of RPSTrainer

class InfoSet {
  constructor() {
    // this.strategy = Array(NUM_ACTIONS).fill(0.0);
    this.culmulativeStrategies = Array(NUM_ACTIONS).fill(0.0);
    this.culmulativeRegrets = Array(NUM_ACTIONS).fill(0.0);
  }

  sumTotal(arr) {
    return arr.reduce((a, v) => a + v);
  }

  // See: https://machinelearningmastery.com/rectified-linear-activation-function-for-deep-learning-neural-networks/
  // ReL: Rectified Linear Activation Function
  rectify(culmulativeRegrets) {
    return culmulativeRegrets.map((v) => (v > 0 ? v : 0));
  }

  normalize(arr) {
    let sum = this.sumTotal(arr);
    let normalizedArr;
    if (sum > 0) {
      normalizedArr = arr.map((v) => v / sum);
    } else {
      normalizedArr = Array(NUM_ACTIONS).fill(1 / NUM_ACTIONS);
    }
    return normalizedArr;
  }

  getStrategy(realizationWeight) {
    // console.log(
    //   this.strategy,
    //   this.culmulativeStrategies,
    //   this.culmulativeRegrets
    // );
    let strategy = this.normalize(this.rectify(this.culmulativeRegrets));
    for (let i = 0; i < NUM_ACTIONS; i++) {
      this.culmulativeStrategies[i] += strategy[i] * realizationWeight;
    }
    // this.culmulativeStrategies = strategy.map((v) => v * realizationWeight);

    return strategy;
  }

  getAverageStrategy() {
    return this.normalize(this.culmulativeStrategies);
  }
}

class KuhnPokerTrainer {
  constructor() {
    this.nodeMap = new Map();
    this.terminalNodes = new Set(["BC", "BB", "CC", "CBB", "CBC"]);
  }

  getHeroVillan(history) {
    let hero = history.length % 2;
    let villan = 1 - hero;
    return [hero, villan];
  }

  isTerminalNode(history) {
    // console.log("terminal check", history);
    return this.terminalNodes.has(history);
  }

  getCardValue(card) {
    return KUHN_CARDS.indexOf(card);
  }

  getPayoff(history, cards) {
    let [hero, villan] = this.getHeroVillan(history);
    let lastCheck = history[history.length - 1] == "C"; // last act is check /fold
    let doubleBet = history == "BB" || history == "CBB";
    let doubleCheck = history == "CC";
    let isPlayerCardHigher =
      this.getCardValue(cards[hero]) > this.getCardValue(cards[villan]);

    // console.log(`----------------------`);
    // console.log(`cards`, cards);
    // console.log(`current player`, hero + 1);
    // // console.log(`hero villan`, cards[hero], cards[villan]);
    // console.log(`isplayerCardHigher`, isPlayerCardHigher);
    // console.log(`history`, history);

    // CC, BC , CBC
    if (lastCheck) {
      // C C
      if (doubleCheck) {
        // console.log(isPlayerCardHigher ? 1 : -1);
        return isPlayerCardHigher ? 1 : -1;
      } else {
        // BC , CBC
        // console.log(1);
        return 1;
      }
    } else if (doubleBet) {
      // BB
      //   console.log(isPlayerCardHigher ? 2 : -2);
      return isPlayerCardHigher ? 2 : -2;
    }
  }

  getInfoSet(curCard, history) {
    let cardAndHistory = `${curCard}-${history}`;
    if (!this.nodeMap.has(cardAndHistory)) {
      this.nodeMap.set(cardAndHistory, new InfoSet());
      //   console.log("new node created");
    }
    return this.nodeMap.get(cardAndHistory);
  }

  train(iterations) {
    let util = 0;
    for (let i = 0; i < iterations; i++) {
      let cards = this.shuffle(KUHN_CARDS).slice(-2);
      let history = "";
      let reachProbabilities = [1, 1];
      //   console.log(cards, history, reachProbabilities);
      util += this.cfr(cards, history, reachProbabilities);
    }

    return util;
  }

  cfr(cards, history, reachProbabilities) {
    // get payoff if last node in game tree
    if (this.isTerminalNode(history)) {
      //   console.log(history, cards);
      return this.getPayoff(history, cards);
    }

    let [hero, villan] = this.getHeroVillan(history);
    // console.log(hero, villan);
    let infoSetNode = this.getInfoSet(cards[hero], history);
    // console.log(infoSetNode);
    let strategy = infoSetNode.getStrategy(reachProbabilities[hero]);
    // console.log(strategy);
    let counterfactualValues = Array(NUM_ACTIONS).fill(0.0);
    let nodeUtilValue = 0;

    for (let [i, action] of ACTIONS.entries()) {
      let newHistory = history + action;
      //   console.log(newHistory);
      let actionProbability = strategy[i];
      let newReachProbabilities = [...reachProbabilities];

      newReachProbabilities[hero] *= actionProbability;

      counterfactualValues[i] = -this.cfr(
        cards,
        newHistory,
        newReachProbabilities
      );

      nodeUtilValue += counterfactualValues[i] * strategy[i];
    }

    for (let i = 0; i < NUM_ACTIONS; i++) {
      infoSetNode.culmulativeRegrets[i] +=
        reachProbabilities[villan] * (counterfactualValues[i] - nodeUtilValue);
    }

    return nodeUtilValue;
  }

  shuffle(cards) {
    let shuffledCards = [...cards];
    for (let i = shuffledCards.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i

      // swap elements array[i] and array[j]
      // we use "destructuring assignment" syntax to achieve that
      // you'll find more details about that syntax in later chapters
      // same can be written as:
      // let t = array[i]; array[i] = array[j]; array[j] = t
      [shuffledCards[i], shuffledCards[j]] = [
        shuffledCards[j],
        shuffledCards[i],
      ];
    }
    return shuffledCards;
  }
}

const trainer = new KuhnPokerTrainer();
let iterations = 100000;
let util = trainer.train(iterations);

console.log(`Running Kuhn Poker chance sampling CFR for ${iterations}`);
console.log(`Expected average game value (for player1): ${-1.0 / 18}`);
console.log(
  `Computed average game value              : ${util / iterations} \n`
);

console.log(`We expect the bet frequency of Jack to be between 0 and 1/3`);
console.log(
  `The bet frequency of a King should be three times the one for a Jack\n`
);

console.log(`History   Bet   Pass\n`);
for (let [key, infoSetNode] of trainer.nodeMap.entries()) {
  console.log(`${key}:         ${infoSetNode.getAverageStrategy()}`);
}

// console.log(KUHN_CARDS);
// console.log(trainer.nodeMap);
