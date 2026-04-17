export interface DetailedError {
  field?: string;
  message?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  mensaje?: string;
  detalle?: string;
  data?: T;
  dataLista?: T[];
  detailedErrors?: DetailedError[];
}
