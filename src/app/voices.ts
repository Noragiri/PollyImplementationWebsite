type EngineType = "standard" | "generative" | "neural";

interface Voice {
  code: string;
  names: Record<string, { gender: "Male" | "Female"; engine: EngineType }>;
}

const voices: Record<string, Voice> = {
  "Arabic": { 
    code: "arb", 
    names: { Zeina: { gender: "Female", engine: "standard" } } 
  },
  "Arabic (Gulf)": { 
    code: "ar-AE", 
    names: { Hala: { gender: "Female", engine: "neural" }, Zayd: { gender: "Male", engine: "neural" } } 
  },
  "Belgian Dutch (Flemish)": { 
    code: "nl-BE", 
    names: { Lisa: { gender: "Female", engine: "neural" } } 
  },
  "Catalan": { 
    code: "ca-ES", 
    names: { Arlet: { gender: "Female", engine: "neural" } } 
  },
  "Chinese (Cantonese)": { 
    code: "yue-CN", 
    names: { Hiujin: { gender: "Female", engine: "neural" } } 
  },
  "Chinese (Mandarin)": { 
    code: "cmn-CN", 
    names: { Zhiyu: { gender: "Female", engine: "standard" } } 
  },
  "Czech": { 
    code: "cs-CZ", 
    names: { Jitka: { gender: "Female", engine: "neural" } } 
  },
  "Danish": { 
    code: "da-DK", 
    names: { 
      Naja: { gender: "Female", engine: "standard" }, 
      Mads: { gender: "Male", engine: "standard" }, 
      Sofie: { gender: "Female", engine: "neural" } 
    } 
  },
  "Dutch": { 
    code: "nl-NL", 
    names: { 
      Lotte: { gender: "Female", engine: "standard" }, 
      Ruben: { gender: "Male", engine: "standard" }, 
      Laura: { gender: "Female", engine: "neural" } 
    } 
  },
  "English (Australian)": { 
    code: "en-AU", 
    names: { 
      Nicole: { gender: "Female", engine: "standard" }, 
      Russell: { gender: "Male", engine: "standard" }, 
      Olivia: { gender: "Female", engine: "generative" } 
    } 
  },
  "English (British)": { 
    code: "en-GB", 
    names: { 
      Amy: { gender: "Female", engine: "standard" }, 
      Emma: { gender: "Female", engine: "standard" }, 
      Brian: { gender: "Male", engine: "standard" }, 
      Arthur: { gender: "Male", engine: "neural" } 
    } 
  },
  "English (Indian)": { 
    code: "en-IN", 
    names: { 
      Aditi: { gender: "Female", engine: "standard" }, 
      Raveena: { gender: "Female", engine: "standard" }, 
      Kajal: { gender: "Female", engine: "generative" } 
    } 
  },
  "English (US)": { 
    code: "en-US", 
    names: { 
      Ivy: { gender: "Female", engine: "standard" }, 
      Joanna: { gender: "Female", engine: "standard" }, 
      Kendra: { gender: "Female", engine: "standard" }, 
      Kimberly: { gender: "Female", engine: "standard" }, 
      Salli: { gender: "Female", engine: "standard" }, 
      Joey: { gender: "Male", engine: "standard" }, 
      Kevin: { gender: "Male", engine: "standard" }, 
      Danielle: { gender: "Female", engine: "generative" }, 
      Matthew: { gender: "Male", engine: "generative" }, 
      Ruth: { gender: "Female", engine: "generative" }, 
      Stephen: { gender: "Male", engine: "generative" }, 
      Gregory: { gender: "Male", engine: "neural" }, 
      Justin: { gender: "Male", engine: "neural" }, 
    } 
  },
  "French": { 
    code: "fr-FR", 
    names: { 
      Céline: { gender: "Female", engine: "standard" }, 
      Léa: { gender: "Female", engine: "standard" }, 
      Mathieu: { gender: "Male", engine: "standard" }, 
      Rémi: { gender: "Male", engine: "generative" } 
    } 
  },
  "German": { 
    code: "de-DE", 
    names: { 
      Marlene: { gender: "Female", engine: "standard" }, 
      Vicki: { gender: "Female", engine: "standard" }, 
      Hans: { gender: "Male", engine: "standard" }, 
      Daniel: { gender: "Male", engine: "generative" } 
    } 
  },
  "Hindi": { 
    code: "hi-IN", 
    names: { 
      Aditi: { gender: "Female", engine: "standard" }, 
      Kajal: { gender: "Female", engine: "generative" } 
    } 
  },
  "Italian": { 
    code: "it-IT", 
    names: { 
      Carla: { gender: "Female", engine: "standard" }, 
      Bianca: { gender: "Female", engine: "standard" }, 
      Giorgio: { gender: "Male", engine: "standard" }, 
      Adriano: { gender: "Male", engine: "neural" } 
    } 
  },
  "Japanese": { 
    code: "ja-JP", 
    names: { 
      Mizuki: { gender: "Female", engine: "standard" }, 
      Takumi: { gender: "Male", engine: "standard" }, 
      Kazuha: { gender: "Female", engine: "neural" }, 
      Tomoko: { gender: "Female", engine: "neural" } 
    } 
  },
  "Korean": { 
    code: "ko-KR", 
    names: { 
      Seoyeon: { gender: "Female", engine: "standard" } 
    } 
  },
  "Spanish (Spain)": { 
    code: "es-ES", 
    names: { 
      Conchita: { gender: "Female", engine: "standard" }, 
      Lucia: { gender: "Female", engine: "standard" }, 
      Enrique: { gender: "Male", engine: "standard" }, 
      Sergio: { gender: "Male", engine: "generative" } 
    } 
  },
  "Spanish (Mexican)": { 
    code: "es-MX", 
    names: { 
      Mia: { gender: "Female", engine: "standard" }, 
      Andrés: { gender: "Male", engine: "generative" } 
    } 
  },
  "Spanish (US)": { 
    code: "es-US", 
    names: { 
      Lupe: { gender: "Female", engine: "generative" }, 
      Pedro: { gender: "Male", engine: "generative" } 
    } 
  },
  "English (South African)": { 
    code: "en-ZA", 
    names: { 
      Ayanda: { gender: "Female", engine: "generative" } 
    } 
  },
  "French (Belgian)": { 
    code: "fr-BE", 
    names: { Isabelle: { gender: "Female", engine: "neural" } } 
  },
  "French (Canadian)": { 
    code: "fr-CA", 
    names: { 
      Gabrielle: { gender: "Female", engine: "neural" }, 
      Liam: { gender: "Male", engine: "neural" } 
    } 
  },
  "German (Austrian)": { 
    code: "de-AT", 
    names: { Hannah: { gender: "Female", engine: "neural" } } 
  },
  "German (Swiss)": { 
    code: "de-CH", 
    names: { Sabrina: { gender: "Female", engine: "neural" } } 
  },
  "English (Irish)": { 
    code: "en-IE", 
    names: { Niamh: { gender: "Female", engine: "neural" } } 
  },
  "English (New Zealand)": { 
    code: "en-NZ", 
    names: { Aria: { gender: "Female", engine: "neural" } } 
  },
  "English (Singaporean)": { 
    code: "en-SG", 
    names: { Jasmine: { gender: "Female", engine: "neural" } } 
  },
  "Finnish": { 
    code: "fi-FI", 
    names: { Suvi: { gender: "Female", engine: "neural" } } 
  },
  "Norwegian": { 
    code: "nb-NO", 
    names: { 
      Ida: { gender: "Female", engine: "neural" }, 
      Liv: { gender: "Female", engine: "standard" } 
    } 
  },
  "Polish": { 
    code: "pl-PL", 
    names: { 
      Ola: { gender: "Female", engine: "neural" }, 
      Ewa: { gender: "Female", engine: "standard" }, 
      Maja: { gender: "Female", engine: "standard" }, 
      Jacek: { gender: "Male", engine: "standard" }, 
      Jan: { gender: "Male", engine: "standard" } 
    } 
  },
  "Portuguese (Brazilian)": { 
    code: "pt-BR", 
    names: { 
      Camila: { gender: "Female", engine: "neural" }, 
      Vitória: { gender: "Female", engine: "neural" }, 
      Thiago: { gender: "Male", engine: "neural" }, 
      Ricardo: { gender: "Male", engine: "standard" } 
    } 
  },
  "Portuguese (European)": { 
    code: "pt-PT", 
    names: { 
      Inês: { gender: "Female", engine: "neural" }, 
      Cristiano: { gender: "Male", engine: "standard" } 
    } 
  },
  "Romanian": { 
    code: "ro-RO", 
    names: { Carmen: { gender: "Female", engine: "standard" } } 
  },
  "Russian": { 
    code: "ru-RU", 
    names: { 
      Tatyana: { gender: "Female", engine: "standard" }, 
      Maxim: { gender: "Male", engine: "standard" } 
    } 
  },
  "Swedish": { 
    code: "sv-SE", 
    names: { 
      Elin: { gender: "Female", engine: "neural" }, 
      Astrid: { gender: "Female", engine: "standard" } 
    } 
  },
  "Turkish": { 
    code: "tr-TR", 
    names: { 
      Burcu: { gender: "Female", engine: "neural" }, 
      Filiz: { gender: "Male", engine: "standard" } 
    } 
  },
  "Welsh": { 
    code: "cy-GB", 
    names: { Gwyneth: { gender: "Female", engine: "standard" } } 
  },
  "Icelandic": { 
    code: "is-IS", 
    names: { 
      Dóra: { gender: "Female", engine: "standard" }, 
      Karl: { gender: "Male", engine: "standard" } 
    } 
  }
};

export default voices;