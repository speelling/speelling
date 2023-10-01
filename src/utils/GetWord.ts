const memoizedGetRandomWord = (
  setSpell: (name: string) => void,
  words: string[]
) => {
  const usedIndices = new Set<number>();

  let randomIndex = Math.floor(Math.random() * words.length);

  while (usedIndices.has(randomIndex)) {
    randomIndex = Math.floor(Math.random() * words.length);
  }

  usedIndices.add(randomIndex);
  setSpell(words[randomIndex]);
  return;
};

export default memoizedGetRandomWord;
