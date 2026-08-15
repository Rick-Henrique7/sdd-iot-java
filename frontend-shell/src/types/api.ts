/** Envelope used by every error response from the api-gateway. */
export interface ApiErrorBody {
  code: string;
  message: string;
  timestamp?: string;
}
