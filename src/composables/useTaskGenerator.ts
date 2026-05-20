export interface Task {
  id: string;
  a: number;
  b: number;
  answer: number;
}

export function useTaskGenerator() {
  function nextTask(previousId?: string): Task {
    for (let i = 0; i < 5; i++) {
      const a = Math.floor(Math.random() * 9) + 1;
      const b = Math.floor(Math.random() * 9) + 1;
      const id = `${a}x${b}`;
      if (id !== previousId) {
        return { id, a, b, answer: a * b };
      }
    }
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    return { id: `${a}x${b}`, a, b, answer: a * b };
  }

  return { nextTask };
}
