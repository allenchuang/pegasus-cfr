Basically CFR can be simplified as:

Constants:

- Actions
- Possible States:

Trainer

- TreeMap to store infoSets:

  - map is stored based on key value pairs:
    - key: stringified history state
    - value: node for that particular history state

- cfr

  - check if beginning of tree:
  - sample random chance:

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
  - get current player:
    - due to sequential action, player take turns for action:
      - can tell by even / odd : player1 / player2 : out of position / in position
        - player = (# of history) % 2 == 0
        - start with no history state or "random, random"
        - first to act is 0, second is 1;
  - get player node from history state:

    - a function that return existing node or create a new one based on infoSet;
      - cur history state
      - player's hand (hole card)
      - treeMap
    - returns:
      - Node for the particular infoset

  - reach probability

  - action_util (utility gained)
  - loop over all possible actions
    - append action to history
    - set action_utility to the negatation of what is returned from cfr next node: the expected util of the next node (since its a 0 sum game)
      - We multiply the expected utility from cfr() by -1 because cfr() returns the utility for the next turn. In a zero-sum two-player game a player’s utility is the opposite of the other player.
  - calculate total util of the node
    - this is the sum of the:
      - action_utility[a] \* strategy[a]

Node

- strategy:
  - the % of taking action a1, a2, ... aN, where N = total number of actions:
    - initial value of all actions distributed equally:
      P(a1) == P(a2)... P(aI) == P(aJ) == 1 / N;
    - [ P(a1), P(a2), ... P(aN) ] where n is total number of actions
- ## strategy_sum:
- regret_sum:
- reach_pr:
  - the probability that we will arrive at this node in the game tree
    - initial value = 0
    - (its value will be populated based on training )
- reach_pr_sum:
