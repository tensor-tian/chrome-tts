type State = {
  paused: boolean;
  pitch: number;
  rate: number;
  volume: number;
  voiceURI: string | undefined;
  selector: string;
  progress: {
    index: number;
    count: number;
  };
};

type Voice = Pick<SpeechSynthesisVoice, "voiceURI" | "lang" | "name">;

export namespace P2C {
  type PlayMsg = {
    req: {
      action: "play";
      data: string;
    };
    resp: State & {
      voices: Voice[];
    };
  };
  type GetStateMsg = {
    req: {
      action: "get-state";
      data: null;
    };
    resp: State & {
      voices: Voice[];
    };
  };
  type SetStateMsg = {
    req: {
      action: "set-state";
      data: Partial<State>;
    };
    resp: State & {
      voices: Voice[];
    };
  };

  export type Message = PlayMsg | PauseMsg | GetStateMsg | SetStateMsg;
}
