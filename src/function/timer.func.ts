class Timer {
  seconds: number;

  p: NodeJS.Timeout | null;

  constructor() {
    this.seconds = 0;
    this.p = null;
  }

  reset() {
    this.seconds = 0;
    if (this.p) clearInterval(this.p);
  }

  start() {
    this.reset();
    this.p = setInterval(() => {
      this.seconds++;
    }, 1000);
  }

  end() {
    if (this.p) clearInterval(this.p);
  }

  getSecs() {
    return this.seconds;
  }
}

export const CountDuration = new Timer();
