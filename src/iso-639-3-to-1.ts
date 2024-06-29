// https://github.com/amitbend/iso-639-3-to-1/blob/master/iso6393.json
// https://en.wikipedia.org/wiki/ISO_639_macrolanguage
const langMap: Record<string, string> = {
  spa: "es",
  eng: "en",
  por: "pt",
  ind: "id",
  fra: "fr",
  deu: "de",
  jav: "jv",
  vie: "vi",
  ita: "it",
  tur: "tr",
  pol: "pl",
  swh: "sw",
  sun: "su",
  hau: "ha",
  fuv: "ff",
  bos: "sh",
  hrv: "sh",
  nld: "nl",
  srp: "sh",
  ckb: "ku",
  yor: "yo",
  uzn: "uz",
  zlm: "ms",
  ibo: "ig",
  ceb: "", // Cebuano is assigned the ISO 639-2 three-letter code ceb, but not a ISO 639-1 two-letter code.
  tgl: "tl",
  hun: "hu",
  azj: "az",
  ces: "cs",
  run: "rn",
  plt: "mg",
  qug: "qu",
  mad: "", // https://en.wikipedia.org/wiki/Madurese_language
  nya: "ny",
  zyb: "za",
  kin: "rw",
  zul: "zu",
  swe: "sw",
  lin: "ln",
  som: "so",
  hms: "", // https://iso639-3.sil.org/code/hms
  hnj: "arz",
  ilo: "", // https://iso639-3.sil.org/code/ilo
  rus: "ru",
  ukr: "uk",
  koi: "kv",
  bel: "be",
  bul: "bg",
  kaz: "kk",
  arb: "ar",
  urd: "ur",
  pes: "fa",
  skr: "", //
  pbu: "ps",
  hin: "hi",
  mar: "mr",
  mai: "", //
  bho: "bh",
  npi: "ne",
  mag: "",
  cmn: "zh",
  ben: "bn",
  jpn: "ja",
  kor: "ko",
  tel: "te",
  tam: "ta",
  guj: "gu",
  kan: "kn",
  mal: "ml",
  mya: "my",
  pan: "pa",
  amh: "am",
  tha: "th",
  sin: "si",
  ell: "el",
};

export function iso6393To1(iso6393: string): string | undefined {
  return langMap[iso6393];
}
