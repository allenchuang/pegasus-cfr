// https://github.com/wadetgong/CFR/blob/master/RPSSelfTrain.js

// // // a best response strategy for player i is one that given all other player strategies, maximizes expected utility for player i.
// // // When every player is playing with a best response strategy to each of the other player's strategies, the combination of the strategies is caleld a Nash equilibrium.
// // // No player can expect to improve play by changing strategy alone.

// // // Given

// // P_gary(Movie) = x

// // // then Monica's utility for picking movie is
// //     2x + 0(1-x)
// // //  ^ monica gets 2 pts if Gary picks Movie
// // //  ^ monica gets 0 pts if Gary picks Game

// // // Monica's utility for picking game
// //     0x + 1(1-x)
// // //  ^ monica gets 0 pts if Gary picks Movie
// // //  ^ monica gets 1 pts if Gary picks Game

// // // thus for Monica to be indifferent to the choice of action
// // 2x + 0(1-x) = 0x + 1(1-x)
// // 2x = 1-x
// // 3x = 1
// // x = 1/3

// // // thus you can find the probability:
// // x = 1/3 ~~ 33.333%

// // // meaning that Monica and Gary can use mixed strategies:

// // Monica P_M(Movie) P_M(Game) = (2/3, 1/3)
// // Gary P_G(Movie) P_G(Game) =  (1/3, 2/3)

// // RPS

// // Definitions
// const ACTION = ["ROCK", "PAPER", "SCISSORS"];
// const NUM_ACTIONS = ACTION.length;

// let regretSum = Array(NUM_ACTIONS).fill(0);
// let strategy = Array(NUM_ACTIONS).fill(0);
// let strategySum = Array(NUM_ACTIONS).fill(0);
// let oppStrategy = [0.4, 0.3, 0.3];
// // let oppStrategy = Array(NUM_ACTIONS).fill(0);
// // let oppStrategySum = Array(NUM_ACTIONS).fill(0);

// //   Generate strategy to represent percentage of choosing action
// function getStrategy() {
//   let normalizingSum = 0;
//   // set strategy to regretSum
//   for (let a = 0; a < NUM_ACTIONS; a++) {
//     strategy[a] = regretSum[a] > 0 ? regretSum[a] : 0;
//     normalizingSum += strategy[a];
//   }

//   for (let a = 0; a < NUM_ACTIONS; a++) {
//     // normalize to return as percentages
//     if (normalizingSum > 0) {
//       strategy[a] /= normalizingSum;
//     } else {
//       // if first time set strategy for actions equally
//       strategy[a] = 1.0 / NUM_ACTIONS;
//     }
//     // Once each probability of this mixed strategy is computed, we accumulate
//     // that probability to a sum of all probabilities computed for that
//     // action across all training iterations.
//     strategySum[a] += strategy[a];
//   }
//   return strategy;
// }

// // Randomly pick an action
// function getAction(strategy) {
//   //   get random float from (0, 1]
//   let r = Math.random();
//   let a = 0;
//   let cumulativeProbability = 0;

//   while (a < NUM_ACTIONS - 1) {
//     cumulativeProbability += strategy[a];
//     if (r < cumulativeProbability) {
//       break;
//     }
//     a++;
//   }
//   return a;
// }

// function train(iterations) {
//   let actionUtility = Array(NUM_ACTIONS).fill(0);
//   for (let i = 0; i < iterations; i++) {
//     // get regret-matched mixed-strategy actions
//     // console.log("iteration", i);
//     let strategy = getStrategy();
//     // console.log("getStrategy", strategy);
//     let myAction = getAction(strategy);
//     let otherAction = getAction(oppStrategy);
//     // console.log("myAction", myAction, ACTION[myAction]);
//     // console.log("otherAction", otherAction, ACTION[otherAction]);

//     // compute action utilities
//     actionUtility[otherAction] = 0;
//     actionUtility[otherAction == NUM_ACTIONS - 1 ? 0 : otherAction + 1] = 1;
//     actionUtility[otherAction == 0 ? NUM_ACTIONS - 1 : otherAction - 1] = -1;

//     // accumualte action regrets
//     for (let a = 0; a < NUM_ACTIONS; a++) {
//       regretSum[a] += actionUtility[a] - actionUtility[myAction];
//     }

//     // if (i % 1000 == 0) {
//     console.log(`----------------------`);
//     console.log("iteration", i);
//     console.log("getStrategy", strategy);
//     console.log("strategySum", strategySum);
//     console.log("myAction", myAction, ACTION[myAction]);
//     console.log("otherAction", otherAction, ACTION[otherAction]);
//     console.log("regretSum", regretSum);
//     console.log(getAverageStrategy());
//     // }
//   }
// }

// function getAverageStrategy() {
//   let avgStrategy = Array(NUM_ACTIONS).fill(0);
//   let normalizingSum = 0;

//   for (let a = 0; a < NUM_ACTIONS; a++) {
//     normalizingSum += strategySum[a];
//   }
//   for (let a = 0; a < NUM_ACTIONS; a++) {
//     if (normalizingSum > 0) {
//       avgStrategy[a] = strategySum[a] / normalizingSum;
//     } else {
//       avgStrategy[a] = 1.0 / NUM_ACTIONS;
//     }
//   }
//   return avgStrategy;
// }

// train(600);

// // class RPSTrainer {
// //     contructor() {

// //     }

// // }

"use strict";

//RPSTrainer file largely taken from http://cs.gettysburg.edu/~tneller/modelai/2013/cfr/

const ROCK = 0;
const PAPER = 1;
const SCISSORS = 2;

const LOG = true;

const NUM_ACTIONS = 3;

class RPSTrainer {
  constructor() {
    this.strategy = [0.0, 0.0, 0.0];
    this.regretSum = [0.0, 0.0, 0.0];
    this.strategySum = [0.0, 0.0, 0.0];

    this.oppStrategy = [0.0, 0.0, 0.0];
    this.oppRegretSum = [0.0, 0.0, 0.0];
    this.oppStrategySum = [0.0, 0.0, 0.0];
  }

  getStrategy() {
    let normalizingSum = 0;
    for (let i = 0; i < NUM_ACTIONS; i++) {
      this.strategy[i] = this.regretSum[i] > 0 ? this.regretSum[i] * 1.0 : 0.0;
      normalizingSum += this.strategy[i];
    }

    if (normalizingSum === 0) {
      let randomStrat = getRandomStrat();
      console.log("New random strat created: ", randomStrat);
      this.strategy = randomStrat;
      normalizingSum = 1;
    }

    for (let i = 0; i < NUM_ACTIONS; i++) {
      this.strategy[i] /= normalizingSum;
      this.strategySum[i] += this.strategy[i];
    }

    if (LOG) {
      console.log("-------- Entering getStrategy() --------");
      console.log("Player stats:");
      console.log("Regret sum: ", this.regretSum);
      console.log("Strategy sum: ", this.strategySum);
      console.log("Strategy: ", this.strategy);
      console.log("Normalizing sum: ", normalizingSum);
      console.log("-------- Exiting getStrategy() --------");
    }
    return this.strategy;
  }
  getOppStrategy() {
    let normalizingSumOpp = 0;
    for (let i = 0; i < NUM_ACTIONS; i++) {
      this.oppStrategy[i] =
        this.oppRegretSum[i] > 0 ? this.oppRegretSum[i] * 1.0 : 0.0;
      normalizingSumOpp += this.oppStrategy[i];
    }
    if (normalizingSumOpp === 0) {
      let randomStrat = getRandomStrat();
      console.log("New random strat created for opp: ", randomStrat);
      this.oppStrategy = randomStrat;
      normalizingSumOpp = 1;
    }

    for (let i = 0; i < NUM_ACTIONS; i++) {
      this.oppStrategy[i] /= normalizingSumOpp;
      this.oppStrategySum[i] += this.oppStrategy[i];
    }

    if (LOG) {
      console.log("-------- Entering getOppStrategy() --------");
      console.log("Opp stats:");
      console.log("Regret sum: ", this.oppRegretSum);
      console.log("Strategy sum: ", this.oppStrategySum);
      console.log("Strategy: ", this.oppStrategy);
      console.log("Normalizing sum: ", normalizingSumOpp);
      console.log("-------- Exiting getOppStrategy() --------");
    }
    return this.oppStrategy;
  }
  //Choose a R/P/S action at random based on given strategy
  getAction(strategy) {
    let rand = Math.random();
    let i = 0;
    let cumulativeProbability = 0;
    while (i < NUM_ACTIONS - 1) {
      cumulativeProbability += strategy[i];
      if (rand < cumulativeProbability) break;
      i++;
    }
    return i;
  }

  train(iterations) {
    let actionUtility = [];
    let oppActionUtility = [];
    let strategy, oppStrategy, myAction, otherAction;
    for (let i = 0; i < iterations; i++) {
      strategy = this.getStrategy();
      oppStrategy = this.getOppStrategy();
      myAction = this.getAction(strategy);
      otherAction = this.getAction(oppStrategy);

      // if myAction === otherAction, then payoff is 0
      // if otherAction is Scissors, then payout for Rock is 1
      // if otherAction is Scissors, then payout for Paper is -1

      actionUtility[otherAction] = 0;
      actionUtility[otherAction === NUM_ACTIONS - 1 ? 0 : otherAction + 1] = 1;
      actionUtility[otherAction === 0 ? NUM_ACTIONS - 1 : otherAction - 1] = -1;

      oppActionUtility[myAction] = 0;
      oppActionUtility[myAction === NUM_ACTIONS - 1 ? 0 : myAction + 1] = 1;
      oppActionUtility[myAction === 0 ? NUM_ACTIONS - 1 : myAction - 1] = -1;

      for (let j = 0; j < NUM_ACTIONS; j++) {
        this.regretSum[j] += actionUtility[j] - actionUtility[myAction];
        this.oppRegretSum[j] +=
          oppActionUtility[j] - oppActionUtility[otherAction];
        if (LOG) {
          console.log("-------- Entering train() --------");
          console.log("Action in loop is: ", j);
          console.log("My chosen action is: ", myAction);
          console.log("Other action is: ", otherAction);
          console.log(
            "Action utility for this action in loop is: ",
            actionUtility[j]
          );
          console.log(
            "Action utility for my action is: ",
            actionUtility[myAction]
          );
          console.log("Regret sum for action in loop is: ", this.regretSum[j]);
          console.log("Regret for all actions is: ", this.regretSum);
          console.log("-------- Exiting train() --------");
        }
      }
    }
  }

  getAverageStrategy() {
    let avgStrategy = [0.0, 0.0, 0.0];
    let normalizingSum = 0;

    for (let i = 0; i < NUM_ACTIONS; i++) {
      normalizingSum += this.strategySum[i];
    }
    for (let i = 0; i < NUM_ACTIONS; i++) {
      if (normalizingSum > 0) {
        // console.log('avg strat', avgStrategy);
        avgStrategy[i] = this.strategySum[i] / normalizingSum;
      } else {
        avgStrategy[i] = 1.0 / NUM_ACTIONS;
      }
    }
    if (LOG) {
      console.log("-------- Entering getAverageStrategy() --------");
      console.log("Strat sum: ", this.strategySum);
      console.log("Strat: ", this.getStrategy());
      console.log("Normalizing sum: ", normalizingSum);
      console.log("-------- Exiting getAverageStrategy() --------");
    }
    return avgStrategy;
  }
}

function getRandomStrat() {
  let action1 = Math.random();
  let action2 = Math.random();
  let action3 = Math.random();
  let sum = action1 + action2 + action3;
  return [action1 / sum, action2 / sum, action3 / sum];
}

const trainer = new RPSTrainer();
trainer.train(10000);
console.log("Final average strat", trainer.getAverageStrategy());
