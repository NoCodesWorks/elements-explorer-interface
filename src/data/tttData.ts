// TTT (Time-Temperature-Transformation) diagram data for common steel alloys
// Each curve is a set of (log10(time_seconds), temperature_K) points

export interface TTTCurve {
  label: string;
  points: [number, number][]; // [log10(seconds), T in °C]
}

export interface TTTDiagram {
  alloyName: string;
  composition: string;
  austenitizingTemp: number; // °C
  curves: {
    ferrite_start?: TTTCurve;
    ferrite_finish?: TTTCurve;
    pearlite_start?: TTTCurve;
    pearlite_finish?: TTTCurve;
    bainite_start?: TTTCurve;
    bainite_finish?: TTTCurve;
    martensite_start: number; // °C
    martensite_50?: number;
    martensite_90?: number;
  };
}

export const tttDiagrams: Record<string, TTTDiagram> = {
  // AISI 1080 (eutectoid steel)
  "1080": {
    alloyName: "AISI 1080",
    composition: "Fe–0.8C",
    austenitizingTemp: 900,
    curves: {
      pearlite_start: {
        label: "Pearlite Start",
        points: [
          [1.0, 700], [0.7, 650], [0.5, 600], [0.4, 550],
          [0.5, 500], [1.0, 450],
        ],
      },
      pearlite_finish: {
        label: "Pearlite Finish",
        points: [
          [2.0, 700], [1.5, 650], [1.2, 600], [1.0, 550],
          [1.2, 500], [2.0, 450],
        ],
      },
      bainite_start: {
        label: "Bainite Start",
        points: [
          [1.0, 450], [0.8, 400], [1.0, 350], [1.5, 300],
          [2.0, 260],
        ],
      },
      bainite_finish: {
        label: "Bainite Finish",
        points: [
          [3.0, 450], [2.5, 400], [2.5, 350], [3.0, 300],
          [4.0, 260],
        ],
      },
      martensite_start: 220,
      martensite_50: 170,
      martensite_90: 100,
    },
  },
  // AISI 1045 (medium carbon)
  "1045": {
    alloyName: "AISI 1045",
    composition: "Fe–0.45C",
    austenitizingTemp: 850,
    curves: {
      ferrite_start: {
        label: "Ferrite Start",
        points: [
          [0.5, 750], [0.3, 700], [0.5, 650],
        ],
      },
      pearlite_start: {
        label: "Pearlite Start",
        points: [
          [0.5, 650], [0.3, 600], [0.2, 550],
          [0.3, 500], [0.8, 450],
        ],
      },
      pearlite_finish: {
        label: "Pearlite Finish",
        points: [
          [1.5, 650], [1.0, 600], [0.8, 550],
          [1.0, 500], [2.0, 450],
        ],
      },
      bainite_start: {
        label: "Bainite Start",
        points: [
          [0.8, 450], [0.5, 400], [0.8, 350],
          [1.5, 300],
        ],
      },
      bainite_finish: {
        label: "Bainite Finish",
        points: [
          [2.5, 450], [2.0, 400], [2.5, 350],
          [3.5, 300],
        ],
      },
      martensite_start: 350,
      martensite_50: 280,
      martensite_90: 200,
    },
  },
  // AISI 4340 (alloy steel)
  "4340": {
    alloyName: "AISI 4340",
    composition: "Fe–0.4C–1.8Ni–0.8Cr–0.25Mo",
    austenitizingTemp: 845,
    curves: {
      ferrite_start: {
        label: "Ferrite Start",
        points: [
          [2.5, 700], [2.0, 650], [2.5, 600],
        ],
      },
      pearlite_start: {
        label: "Pearlite Start",
        points: [
          [2.5, 600], [2.0, 575], [1.8, 550],
          [2.0, 500], [3.0, 450],
        ],
      },
      pearlite_finish: {
        label: "Pearlite Finish",
        points: [
          [4.0, 600], [3.5, 575], [3.0, 550],
          [3.5, 500], [4.5, 450],
        ],
      },
      bainite_start: {
        label: "Bainite Start",
        points: [
          [1.5, 450], [1.0, 400], [0.8, 350],
          [1.0, 300], [1.5, 280],
        ],
      },
      bainite_finish: {
        label: "Bainite Finish",
        points: [
          [3.5, 450], [3.0, 400], [3.0, 350],
          [3.5, 300], [4.5, 280],
        ],
      },
      martensite_start: 300,
      martensite_50: 240,
      martensite_90: 160,
    },
  },
};
