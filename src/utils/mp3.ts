export const getmp3 = async (spell: string): Promise<string> => {
  const response = await fetch(
    `https://api.dictionaryapi.dev/api/v2/entries/en/${spell}`
  );
  const data = await response.json();

  for (const phonetic of data[0].phonetics) {
    if (phonetic.audio) {
      return phonetic.audio;
    }
  }

  // Throw an error if no audio property is found in any phonetics
  throw new Error("No audio found in phonetics");
};
