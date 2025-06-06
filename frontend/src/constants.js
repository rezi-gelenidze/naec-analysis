export const subjects = {
    MATHEMATICS: {name: "მათემატიკა", score: 51},
    HISTORY: {name: "ისტორია", score: 60},
    CHEMISTRY: {name: "ქიმია", score: 63},
    PHYSICS: {name: "ფიზიკა", score: 63},
    BIOLOGY: {name: "ბიოლოგია", score: 70},
};

export const subject_points = {
    "GEORGIAN LANGUAGE": 60,
    "FOREIGN LANGUAGE": 70,
    "MATHEMATICS": 51,
    "HISTORY": 60,
    "CHEMISTRY": 63,
    "PHYSICS": 63,
    "BIOLOGY": 70,
};

export const allowed_combinations = {
    MATHEMATICS: ["MATHEMATICS"],
    HISTORY: ["HISTORY"],
    PHYSICS: ["PHYSICS"],
    BIOLOGY: ["BIOLOGY"],
    CHEMISTRY: ["CHEMISTRY"],
    BIOLOGY_CHEMISTRY: ["BIOLOGY", "CHEMISTRY"],
    BIOLOGY_MATHEMATICS: ["BIOLOGY", "MATHEMATICS"],
    BIOLOGY_PHYSICS: ["BIOLOGY", "PHYSICS"],
};

export const grant_thresholds = {
    BIOLOGY: [
        {"year": 2021, "50": 5807.5, "70": 5940, "100": 6014.5},
        {"year": 2022, "50": 5719.5, "70": 5907, "100": 5992},
        {"year": 2023, "50": 5752, "70": 5934, "100": 6030},
        {"year": 2024, "50": 5736, "70": 5937.5, "100": 6038}
    ],
    CHEMISTRY: [
        {"year": 2021, "50": 5774.5, "70": 5970.5, "100": 6031.5},
        {"year": 2022, "50": 5638, "70": 5886, "100": 5981},
        {"year": 2023, "50": 5686.5, "70": 5920.5, "100": 6010},
        {"year": 2024, "50": 5651.5, "70": 5932.5, "100": 6030.5}
    ],
    HISTORY: [
        {"year": 2021, "50": 5747.5, "70": 5963.5, "100": 6077.5},
        {"year": 2022, "50": 5810.5, "70": 5990.5, "100": 6086},
        {"year": 2023, "50": 5804, "70": 5966.5, "100": 6060},
        {"year": 2024, "50": 5801.5, "70": 6008, "100": 6109}
    ],
    MATHEMATICS: [
        {"year": 2021, "50": 5623, "70": 5932, "100": 6106},
        {"year": 2022, "50": 5713.5, "70": 5964.5, "100": 6102},
        {"year": 2023, "50": 5713.5, "70": 5986, "100": 6141.5},
        {"year": 2024, "50": 5668, "70": 5971, "100": 6155}],
    PHYSICS: [
        {"year": 2021, "50": 4922, "70": 5562, "100": 5896.5},
        {"year": 2022, "50": 4769, "70": 5116.5, "100": 5651},
        {"year": 2023, "50": 4853, "70": 5566, "100": 5826},
        {"year": 2024, "50": 4920, "70": 5638, "100": 5866}
    ]
};
