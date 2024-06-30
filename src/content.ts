import { P2C, State, Voice } from "./types";
// import pick from "lodash.pick";
import EasySpeech from "easy-speech";
// import { franc } from "franc-min";
// import { iso6393To1 } from "./iso-639-3-to-1";
import TurndownService from "turndown";
import markdownToText from "markdown-to-text";

console.log("detect speech:", EasySpeech.detect());

console.log("This is a content script.");
const turndownService = new TurndownService();

chrome.runtime.onMessage.addListener(
  (
    request: P2C.Message["req"],
    sender,
    sendResponse: (data: P2C.Message["resp"]) => void
  ) => {
    console.log(
      sender.tab
        ? "from a content script:" + sender.tab.url
        : "from the extension"
    );
    console.log("request:", request);
    handleP2CMessage(request).then(sendResponse);
    return true;
  }
);

// https://stackoverflow.com/questions/44056271/chrome-runtime-onmessage-response-with-async-await
async function handleP2CMessage(
  request: P2C.Message["req"]
): Promise<P2C.Message["resp"]> {
  switch (request.action) {
    case "play": {
      const selector = request.data;
      const speaker = await Speaker.getInstance();
      const { paused } = speaker.getState();
      if (paused) {
        speaker.loadTextList(selector);
        speaker.start();
        speaker.play().catch(console.error);
      } else {
        speaker.pause();
      }
      return speaker.getState();
    }
    case "get-state": {
      const speaker = await Speaker.getInstance();
      console.log("state:", speaker.getState());
      return speaker.getState();
    }
    case "set-state": {
      const state = request.data;
      const speaker = await Speaker.getInstance();
      speaker.setState(state);
      console.log("state:", speaker.getState());
      return speaker.getState();
    }
  }
  console.warn("unexpected request:", request);
  return false;
}

class Speaker {
  public static instance: Speaker;
  private list: string[] = [];
  private i: number = 0;
  private state = {
    options: {
      pitch: 1.1,
      rate: 1.65,
      volume: 1,
      voice: undefined as SpeechSynthesisVoice | undefined,
    },
    lang: "",
    paused: true,
    selector: "",
  };
  private voices: SpeechSynthesisVoice[] = [];

  getState(): State & {
    voices: Voice[];
  } {
    return {
      ...pick(this.state.options, ["pitch", "rate", "volume"]),
      paused: this.state.paused,
      voiceURI: this.state.options.voice?.voiceURI,
      selector: this.state.selector,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      voices: this.voices.map((v) => pick(v, ["voiceURI", "lang", "name"])),
      progress: {
        index: this.i,
        count: this.list.length,
      },
    };
  }
  setState(options: Partial<State>) {
    this.state.options = {
      ...this.state.options,
      ...pick(options, ["pitch", "rate", "volume"]),
    };
    if (options.voiceURI) {
      this.state.options.voice = this.voices.find(
        (v) => v.voiceURI === options.voiceURI
      );
    }
    if (options.progress) {
      this.i = options.progress.index;
    }
    this.state = {
      ...this.state,
      ...pick(options, ["paused", "selector"]),
    };
  }

  static async getInstance(): Promise<Speaker> {
    if (!Speaker.instance) {
      Speaker.instance = new Speaker();
      const ok = await EasySpeech.init({ maxTimeout: 5000, interval: 250 })
        .then(() => {
          console.debug("load complete");
          Speaker.instance.voices = speechSynthesis.getVoices();
          console.log(
            "langs:",
            Speaker.instance.voices.reduce((set, v) => {
              set.add(v.lang);
              return set;
            }, new Set<string>())
          );
          Speaker.instance.state.options.voice = Speaker.instance.voices.find(
            (v) => v.voiceURI === "Lilian"
          );
          Speaker.instance.loadTextList("#content");
          return true;
        })
        .catch((e) => {
          console.log(e);
          return false;
        });
      if (!ok) {
        console.log("Easy Speech init failed.");
      }
    }
    return Speaker.instance;
  }
  loadTextList(selector: string) {
    if (selector === this.state.selector) {
      return;
    }
    this.state.selector = selector;
    const content = document.querySelector(this.state.selector);
    if (!content) return;
    removeInvisibleDescendants(content as HTMLElement);

    const md = turndownService.turndown(content as TurndownService.Node);
    const text = markdownToText(md);
    this.list = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    this.i = 0;
  }
  async play() {
    let ok = true;
    // https://github.com/leaonline/easy-speech/blob/HEAD/API.md
    while (ok && !this.state.paused && this.i < this.list.length) {
      const text = this.list[this.i];
      ok = await EasySpeech.speak({ ...this.state.options, text })
        .then(() => true)
        .catch((err) => {
          console.log("speak error:", err);
          return false;
        });
      if (!this.state.paused) {
        this.i++;
      }
    }
  }
  start() {
    this.state.paused = false;
  }
  pause() {
    this.state.paused = true;
    EasySpeech.cancel();
  }
}

function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Partial<T> {
  const res: Partial<T> = {};
  for (const k of keys) {
    if (typeof obj[k] !== "undefined") {
      res[k] = obj[k];
    }
  }
  return res;
}

function removeInvisibleDescendants(parentElement: HTMLElement) {
  // Helper function to recursively traverse and remove invisible descendants
  function traverseAndRemove(element: HTMLElement) {
    // Check if the element itself is invisible
    const computedStyle = window.getComputedStyle(element);
    if (
      computedStyle.display === "none" ||
      computedStyle.visibility === "hidden" ||
      parseFloat(computedStyle.opacity) === 0
    ) {
      element.remove(); // Remove the invisible element from the DOM
      return; // Exit this branch of recursion
    }

    // Traverse child nodes recursively
    for (let i = element.children.length - 1; i >= 0; i--) {
      const child = element.children[i] as HTMLElement;
      traverseAndRemove(child);
    }
  }

  // Start traversal from the parent element
  traverseAndRemove(parentElement);
}
