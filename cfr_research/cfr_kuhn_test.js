"use strict";

const PASS = 0;
const BET = 1;

const LOG = true;

const NUM_ACTIONS = 2;

// each information set is represented by an inner class Node.
// each node has fields corresponding to the regret and strategy variable definitions of RPSTrainer

class Node {
  constructor() {
    this.infoset;
    this.regretSum = [0.0, 0.0];
    this.strategy = [0.0, 0.0];
    this.strategySum = [0.0, 0.0];
  }

  getStrategy(realizationWeight) {
    let normalizingSum = 0; // used to store total sum in order to "normalize" the overall strategy

    // for each action
    for (let a = 0; a < NUM_ACTIONS; a++) {
      // the strategy for this action is equal to the regretSum if it exists or 0
      this.strategy[a] = this.regretSum[a] > 0 ? this.regretSum[a] : 0;

      // accumulate the strategy value if there is one.
      normalizingSum += this.strategy[a];
    }

    // for each action
    for (let a = 0; a < NUM_ACTIONS; a++) {
      // if its not the first time to calculate strategy
      if (normalizingSum > 0) {
        // normalize the responding strategy
        this.strategy[a] /= normalizingSum;
      } else {
        // first time, set strategy to 1/2, meaning 50% / 50% chance for each action
        this.strategy[a] = 1.0 / NUM_ACTIONS;
      }

      this.strategySum[a] += realizationWeight * this.strategy[a]; // ??
    }
    return this.strategy;
  }

  getAverageStrategy() {
    let avgStrategy = Array(NUM_ACTIONS).fill(0);
    let normalizingSum = 0;
    for (let a = 0; a < NUM_ACTIONS; a++) {
      normalizingSum += this.strategySum[a];
    }
    for (let a = 0; a < NUM_ACTIONS; a++) {
      if (normalizingSum > 0) {
        avgStrategy[a] = this.strategySum[a] / normalizingSum;
      } else {
        avgStrategy[a] = 1.0 / NUM_ACTIONS;
      }
      return avgStrategy;
    }
  }

  toString() {
    //   is this needed?
    //   return String.format()
  }
}

class KuhnPokerTrainer {
  constructor() {
    this.nodeMap = new Map();
  }

  train(iterations) {
    let cards = [1, 2, 3];
    let util = 0;
    for (let i = 0; i < iterations; i++) {
      for (let c1 = cards.length - 1; c1 > 0; c1--) {
        // TODO: is this right? // shuffle to get random index from 0 to length - 1
        let c2 = this.shuffle();
        [cards[c1], cards[c2]] = [cards[c2], cards[c1]];
      }

      util += this.cfr(cards, "", 1, 1);
    }

    console.log("nodeMap", this.nodeMap);
    console.log("Average game value: " + util / iterations);
  }

  cfr(cards, history, p0, p1) {
    let plays = history.length; // get length of history

    // switching perspectives:
    // swap between player and opponent depending on history
    let player = plays % 2; // start with player 0 as hero ( 0 % 2 == 0 )
    let opponent = 1 - player; // start with player 1 as villan ( 1 - 0 == 1 )

    // IF TERMINAL STATE (meaning 2 actions taken)
    // RETURN PAYOFF FOR TERMINAL STATE
    if (plays > 1) {
      let terminalPass = history.charAt(plays - 1) == "p"; // final action: opponent passes
      let doubleBet = history.substring(plays - 2, plays) == "bb"; // two bets
      let isPlayerCardHigher = cards[player] > cards[opponent]; // evaluate hand strength

      // if opponent passes
      if (terminalPass) {
        //   check if hero passes as well
        if (history == "pp") {
          return isPlayerCardHigher ? 1 : -1; // return +1 for winner and -1 for loser
        } else {
          // hero bet and opponent fold
          return 1; // return +1 for hero regardless of hand
        }
      } else if (doubleBet) {
        // if both players bets in the two rounds
        return isPlayerCardHigher ? 2 : -2; // return +2 for winner and -2 for loser
      }
    }

    // IF NOT TERMINAL STATE
    // append players card to the action history
    let infoSet = cards[player] + history;
    // find node in nodeMap
    let node = this.nodeMap.get(infoSet);
    // if node doesn't exist create one and set its infoSet to the current one
    if (node == null) {
      node = new Node();
      node.infoSet = infoSet;

      // finally, store this node in nodeMap with infoSet as its key
      this.nodeMap.set(infoSet, node);
    }

    // FOR EACH ACTION AVAILABLE:
    // RECURSIVELY CALL "CFR" WITH ADDITIONAL HISTORY AND PROBABILITY

    // get strategy for node player passing in hero probability or villian probabilitiy
    let strategy = node.getStrategy(player == 0 ? p0 : p1); // start with p0, p1 = 1

    // init util as array corresponding to the utlity the player
    let util = Array(NUM_ACTIONS).fill(0);

    let nodeUtil = 0; // ??

    // for each action in available actions
    for (let a = 0; a < NUM_ACTIONS; a++) {
      // there is only 2
      let nextHistory = history + (a == 0 ? "p" : "b"); // if a =0 simulate check ; if a = 1 simulate bet
      // util of "a"
      util[a] =
        player == 0
          ? -this.cfr(cards, nextHistory, p0 * strategy[a], p1) // CFR returns utility
          : -this.cfr(cards, nextHistory, p0, p1 * strategy[a]); // ?? why negative

      nodeUtil += strategy[a] * util[a]; // percentage of the action * the utlity of this action
    }

    // for each action
    for (let a = 0; a < NUM_ACTIONS; a++) {
      // regret = utlity you get from this action - utility from
      let regret = util[a] - nodeUtil;
      node.regretSum += (player == 0 ? p1 : p0) * regret;
    }

    return nodeUtil;
  }

  shuffle() {
    return this.randomIntFromInterval(0, NUM_ACTIONS);
  }

  randomIntFromInterval(min, max) {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}

const trainer = new KuhnPokerTrainer();
trainer.train(10000);
