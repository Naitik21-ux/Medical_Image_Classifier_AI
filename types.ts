
export interface AttentionArea {
  x: number; // percentage from left (0-100)
  y: number; // percentage from top (0-100)
  radius: number; // percentage of image width (0-100)
}

export interface Diagnosis {
  condition: string;
  probability: number; // 0 to 1
  attentionArea: AttentionArea;
}

export interface DiagnosisResult {
  diagnoses: Diagnosis[];
  radiologistReport: string;
}
