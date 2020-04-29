// https://justinsermeno.com/posts/cfr/

// "c" for calling
// "b" for betting
const ACTIONS = ["c", "b"];

// hand strength
// J = 0;
// Q = 1;
// K  = 2;
const CARDS = ["J", "Q", "K"];

class KuhnPokerTrainer {
  constructor(iterations) {
    this.nodeMap = {};
    this.iterations = 10000;
    this.expected_game_value = 0;
  }

  train() {
    for (let i = 0; i < this.iterations; i++) {
      this.expected_game_value += cfr(nodeMap);
      for (let node of this.nodeMap.values()) {
        node.next_strategy();
      }
    }

    this.expected_game_value /= this.iterations;

    display_results(this.expected_game_value, nodeMap);
  }

  static is_chance_node(history) {
    //   return true if no history
    //   meaning that its a chance node
    return history == "";
  }

  static chance_util(nodeMap) {
    let expected_value = 0;
    let n_posiiblities = 6; // 6 combinatinons of hands (3 pick 1) * (2 pick 1)
    for (let [i, card1] of CARDS.entries()) {
      for (let [j, card2] of CARDS.entries()) {
        if (i != j) {
          // get different card values to initiate game
          // p1, p2 = 1 because neither player has taken any actions; their reach prob is 1
          // pc = 1/n_possibilities because each chance event has a uniformly random probability of occuring 1/6 times;
          expected_value += cfr(nodeMap, "rr", i, j, 1, 1, 1 / n_posiiblities);
        }
      }
    }

    return expected_value / n_posiiblities;
  }

  static is_terminal(history) {
    let possibilities = new Set(["rrcc", "rrcbc", "rrcbb", "rrbc", "rrbb"]);
    return possibilities.has(history);
  }

  static terminal_util(history, card1, card2) {
    let n = history.length;

    let hero = n % 2 == 0 ? card1 : card2;
    let villan = n % 2 == 0 ? card2 : card1;

    if (history == "rrcbc" || history == "rrbc") {
      //   last player folded. The current player wins
      return 1;
    } else if (history == "rrccc") {
      // check all the way to showdown
      return hero > villan ? 1 : -1;
    } else if (history == "rrcbb" || history == "rrbb") {
      return hero > villan ? 2 : -2;
    }
  }

  // Parameters
  // @nodeMap : map
  // @history : string
  // @card1 : int
  // @card2 : int
  // @p1 : float : probability that playerA reaches 'history'
  // @p2 : float : probability that playerB reaches 'history'
  // @pc : float : probability contribution of chance event to reach 'history'
  cfr(nodeMap, history = "", card1 = -1, card2 = -1, p1 = 1, p2 = 1, pc = 1) {
    // base case:
    // start of node
    if (is_chance_node(history)) {
      return chance_util(nodeMap);
    }

    if (is_terminal(history)) {
      return terminal_util(history, card1, card2);
    }

    const n = history.length;
    const is_player_1 = n % 2 == 0;
    const info_set = get_info_set(
      nodeMap,
      is_player_1 ? card1 : card2,
      history
    );

    let strategy = info_set.strategy;
    if (is_player_1) {
      info_set.reach_pr += p1;
    } else {
      info_set.reach_pr += p2;
    }

    // Counterfactual utility per action
    let action_utils = Array(ACTIONS.length).fill(0);

    for (let [i, action] of ACTIONS.entries()) {
      let next_history = history + action;
      if (is_player_1) {
        action_utils[i] =
          -1 *
          this.cfr(
            nodeMap,
            next_history,
            card1,
            card2,
            p1 * strategy[i],
            p2,
            pc
          );
      } else {
        action_utils[i] =
          -1 *
          this.cfr(
            nodeMap,
            next_history,
            card1,
            card2,
            p1,
            p2 * strategy[i],
            pc
          );
      }
    }

    let util = sum(action_utils * strategy);
  }
}
