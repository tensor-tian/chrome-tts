import { useCallback, useEffect, useMemo, useState } from "react";
import IconButton from "@mui/material/IconButton";
import {
  TbPlayerPauseFilled as IconPause,
  TbPlayerPlayFilled as IconPlay,
} from "react-icons/tb";
import Input from "@mui/material/Input";
import Button from "@mui/material/Button";
import { send } from "./message";
import { ChangeEvent } from "react";
import MuiSlider from "@mui/material/Slider";
import { P2C, State, Voice } from "../types";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { FormControl, InputLabel } from "@mui/material";

type SettingProps = {
  update(state: Partial<State>): void;
  data: State & {
    voices: Voice[];
  };
};

type SliderProps = {
  value: number;
  name: string;
  onChange: (_e: Event, v: number | number[]) => void;
  max: number;
  min: number;
  step: number;
};
function Slider({ value, name, max, min, step, onChange }: SliderProps) {
  return (
    <div className="flex">
      <label className="w-16 mr-3 text-sm">{name}:</label>
      <MuiSlider
        aria-label={name}
        value={value}
        marks
        valueLabelDisplay="auto"
        step={step}
        min={min}
        max={max}
        size="small"
        onChange={onChange}
      />
    </div>
  );
}

function Setting({
  data: { volume, rate, pitch, voiceURI, voices, progress },
  update,
}: SettingProps) {
  const [onVolumeChange, onRateChange, onPitchChange] = useMemo(() => {
    const gen = (key: string) => (_e: Event, v: number | number[]) => {
      update({
        [key]: Array.isArray(v) ? v[0] : v,
      });
    };
    return [gen("volume"), gen("rate"), gen("pitch")];
  }, [update]);
  const [lang, setLang] = useState("");
  const [langs, voiceMap] = useMemo(() => {
    const langs = new Set<string>();
    const voiceMap: Map<string, Voice[]> = new Map();
    for (const v of voices) {
      langs.add(v.lang);
      const list = voiceMap.get(v.lang) || [];
      list.push(v);
      voiceMap.set(v.lang, list);
    }
    return [[...langs].sort(), voiceMap];
  }, [voices]);
  useEffect(() => {
    const voice = voices.find((v) => v.voiceURI === voiceURI);
    if (voice) {
      setLang(voice.lang);
    }
  }, [voiceURI, voices]);
  const onLangChange = useCallback(
    (e: { target: { value: string; name: string } }) => {
      setLang(e.target.value);
    },
    []
  );
  const onVoiceChange = useCallback(
    (e: { target: { value: string; name: string } }) => {
      console.log("update:", "voiceURI", e.target);
      update({
        voiceURI: e.target.value,
      });
    },
    [update]
  );
  const onProgressChange = useCallback(
    (_e: Event, v: number | number[]) => {
      update({
        progress: {
          index: Array.isArray(v) ? v[0] : v,
          count: progress.count,
        },
      });
    },
    [progress.count, update]
  );
  return (
    <div className="flex flex-col px-2 gap-3 mt-3">
      <div className="flex gap-2">
        <FormControl className="flex-grow">
          <InputLabel id="select-lang-label" className="bg-white">
            Lang
          </InputLabel>
          <Select
            labelId="select-lang-label"
            id="select-voice"
            value={lang}
            onChange={onLangChange}
            size="small"
          >
            {langs.map((lang) => (
              <MenuItem value={lang}>{lang}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl className="flex-grow">
          <InputLabel id="select-voice-label" className="bg-white">
            voice
          </InputLabel>
          <Select
            labelId="select-voice-label"
            id="select-voice"
            value={voiceURI}
            onChange={onVoiceChange}
            size="small"
          >
            {voiceMap.get(lang)?.map((v) => (
              <MenuItem value={v.voiceURI}>{v.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
      <Slider
        name="Volume"
        value={volume}
        onChange={onVolumeChange}
        min={0.1}
        max={1.0}
        step={0.05}
      />
      <Slider
        name="Rate"
        value={rate}
        onChange={onRateChange}
        min={0.5}
        max={2.0}
        step={0.05}
      />
      <Slider
        name="Pitch"
        value={pitch}
        onChange={onPitchChange}
        min={0.5}
        max={2.0}
        step={0.05}
      />
      <Slider
        name="Progress"
        value={progress.index}
        onChange={onProgressChange}
        min={0}
        max={progress.count - 1}
        step={1}
      />
    </div>
  );
}
function App() {
  const [selector, setSelector] = useState("body");
  const changeSelector = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSelector(e.currentTarget.value);
  }, []);
  const [data, setData] = useState<
    State & {
      voices: Voice[];
    }
  >();
  const togglePlay = useCallback(async () => {
    send<P2C.PlayMsg>({
      action: "play",
      data: selector,
    }).then((resp) => {
      if (resp) {
        setData(resp);
        setSelector(resp.selector);
      }
    });
  }, [selector]);
  const update = useCallback((state: Partial<State>) => {
    send<P2C.SetStateMsg>({
      action: "set-state",
      data: state,
    }).then((resp) => {
      if (resp) {
        setData(resp);
        setSelector(resp.selector);
      }
    });
  }, []);

  useEffect(() => {
    send<P2C.GetStateMsg>({
      action: "get-state",
      data: null,
    }).then((resp) => {
      if (resp) {
        setData(resp);
        setSelector(resp.selector);
      }
    });
  }, []);
  return (
    <div className="w-[400px] h-[400px] flex flex-col">
      <h1 className="text-2xl font-bold py-2 text-center">TTS</h1>
      <div className="flex justify-start px-2 items-baseline">
        <label className="text-sm mr-2 w-30">CSS Selector: </label>
        <Input
          id="css-selector"
          inputProps={{ "aria-label": "css selector" }}
          size="small"
          value={selector}
          onChange={changeSelector}
          className="flex-grow mr-1 font-mono text-sm"
        />
        <Button variant="text" className="w-10" size="small">
          <IconButton aria-label="Play | Pause" onClick={togglePlay}>
            {data?.paused ? <IconPlay /> : <IconPause />}
          </IconButton>
        </Button>
      </div>
      {data && <Setting data={data!} update={update} />}
    </div>
  );
}

export default App;
