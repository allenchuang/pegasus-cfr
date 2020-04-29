Basically CFR can be simplified as:

Constants:

- Actions
- Possible States:

Trainer

- TreeMap to store infoSets:

  - map is stored based on key value pairs:
    - key: stringified history state
    - value: node for that particular history state

- train

  - instantiate ev_sum = 0;
  - run over all iterations:
    - populate treeMap with nodes by recursively calling cfr:
    - initial: ev_sum += cfr(treeMap, "", 1, 1, 1);
      - this will trigger call for is_chance_node, which will trigger cascading calls
      - within the loop call Node.next_strategy():

* cfr

  - BASE CASES:
    - check if beginning of tree:
      - sample random chance
        - setting up the inital conditions:
        - generate hands / shuffle deck and draw...etc
        - intial hand ranges...etc
      - initial reach_probability for both players would be (1,1):
        - reach_probability_1 = 1, reach_probability_2 = 1
        - neither has taken any actions
      - reach_probability_chance: The probability contribution of chance events:
    - check if terminal node
      - if terminal calculate utility
        - which is a result of recursively calling cfr
  - GET CURRENT PLAYER:
    - due to sequential action, player take turns for action:
      - can tell by even / odd : player1 / player2 : out of position / in position
        - player = (# of history) % 2 == 0
        - start with no history state or "random, random"
        - first to act is 0, second is 1;
  - GET NODE IN TREEMAP FROM HISTORY STATE:

    - a function that return existing node or create a new one based on infoSet;
      - cur history state
      - player's hand (hole card)
      - treeMap
    - returns:
      - Node for the particular infoset

  - SET REACH PROBABILITY FOR NODE

  - CREATE ACTION_UTILITY ARRAY (utility gained)

  - loop over all possible actions

    - append action to history
    - set action_utility to the negatation of what is returned from cfr next node: the expected util of the next node (since its a 0 sum game)
      - We multiply the expected utility from cfr() by -1 because cfr() returns the utility for the next turn. In a zero-sum two-player game a player’s utility is the opposite of the other player.

  - TOTAL_UTIL:

    - calculate total util of the node
    - this is the acculmulative sum of action_utility \* probability of action:
      - action_utility[a] \* strategy[a]

  - REGRETS:

    - array which is action_util[a] - TOTAL_UTIL for all actions a.
    - [ action_util[a1] - total_util, action_util[a2] - total_util ]

  - UPDATE NODE TOTAL_REGRETS_OVERTIME:

    - loop over all actions:
      - counterfactual_regret[ai] = reach_probability[opponent] \* REGRET:
    - total_regrets[ai] += counterfactual_regret[ai];

  - RETURN UTIL

Node

- STATES:

  - strategy (array):
    - the % of taking action a1, a2, ... aN, where N = total number of actions:
      - initial value of all actions distributed equally:
        P(a1) == P(a2)... P(aI) == P(aJ) == 1 / N;
      - [ P(a1), P(a2), ... P(aN) ] where n is total number of actions
  - strategy_sum (array):
    - for all probability in strategy multiply by reach_pr
  - total_regrets (array):
    -array of total calculated regret for each action
  - reach_pr:
    - the probability that we will arrive at this node in the game tree
      - initial value = 0
      - (its value will be populated based on training )
  - reach_pr_sum:
    - while training get the total of all reach_pr

- FUNCTIONS:

  - next_strategy:
    - calculate strategy_sum (array):
      - loop over strategy array multiply by reach_pr
    - set strategy to updated strategy by calling get_update_strategy
    - set reach_pr_sum to sum of all reach_pr
      - reach_pr_sum += reach_pr
    - reset reach_pr to 0;
  - get_update_strategy:

    - calculate current strategy from the total_regrets
    - set all negative values in total_regrets to 0
    - NORMALIZE strategy

      - get total sum of strategy to normalize strategy
      - if total sum of strategy is > 0 ( positive )
        - set each probability in strategy to P(aX) / total
      - else
        - reset strategy to equal 1/ACTIONS

    - return strategy

  - get_average_strategy:
    - calculate average strategy over all iterations to get Nash equilibrium strategy
    - set stratgey to strate
