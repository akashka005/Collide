import { TicTacToeState, TriviaQuestion, WouldYouRatherPrompt } from '../types';

export function checkTicTacToeWinner(board: Array<'X' | 'O' | null>): 'X' | 'O' | 'tie' | null {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  if (board.every((cell) => cell !== null)) {
    return 'tie';
  }

  return null;
}

export const TRIVIA_BANK: TriviaQuestion[] = [
  {
    id: 't-1',
    category: 'Pop Culture & Gaming',
    question: 'In Minecraft, what is the rare structure found floating in the End dimension?',
    options: ['End Fortress', 'End City', 'Void Citadel', 'Dragon Roost'],
    correctAnswer: 1,
  },
  {
    id: 't-2',
    category: 'Science & Cosmos',
    question: 'Which planet in our solar system has the most moons confirmed by astronomers?',
    options: ['Jupiter', 'Saturn', 'Uranus', 'Neptune'],
    correctAnswer: 1,
  },
  {
    id: 't-3',
    category: 'Cinema & Anime',
    question: 'Which Studio Ghibli film features the magical flying bathhouse and No-Face?',
    options: ['Howl\'s Moving Castle', 'Spirited Away', 'Princess Mononoke', 'Kiki\'s Delivery Service'],
    correctAnswer: 1,
  },
  {
    id: 't-4',
    category: 'Tech & Music',
    question: 'What year did Spotify officially launch to the public?',
    options: ['2006', '2008', '2010', '2012'],
    correctAnswer: 1,
  },
  {
    id: 't-5',
    category: 'World Mysteries',
    question: 'What is the deepest known oceanic trench on Earth?',
    options: ['Tonga Trench', 'Puerto Rico Trench', 'Mariana Trench', 'Java Trench'],
    correctAnswer: 2,
  },
];

export const WOULD_YOU_RATHER_BANK: WouldYouRatherPrompt[] = [
  {
    id: 'wyr-1',
    optionA: 'Live 100 years in the past with full modern knowledge',
    optionB: 'Live 100 years into the future knowing nothing about what happened',
    votesA: 42,
    votesB: 58,
  },
  {
    id: 'wyr-2',
    optionA: 'Never have to sleep again with zero fatigue',
    optionB: 'Be able to teleport anywhere instantly once per day',
    votesA: 37,
    votesB: 63,
  },
  {
    id: 'wyr-3',
    optionA: 'Always have the perfect witty comeback on the spot',
    optionB: 'Always know when someone is telling a white lie',
    votesA: 55,
    votesB: 45,
  },
  {
    id: 'wyr-4',
    optionA: 'Explore the deepest unexplored trenches of the ocean',
    optionB: 'Explore an uncharted habitable exoplanet in space',
    votesA: 28,
    votesB: 72,
  },
];

export const COPILOT_ICEBREAKERS = [
  "“What's the best concert or festival you've ever experienced in person?”",
  "“If you could instantly speak any language fluently tomorrow, which one?”",
  "“What is a movie or game you wish you could experience again for the first time?”",
  "“What weird food combination do you love that other people judge?”",
  "“What's the most scenic place you've ever visited?”",
  "“If you had a free weekend with no responsibilities, what would you spend it doing?”",
  "“What obscure topic could you give an impromptu 20-minute TED talk about?”",
];
