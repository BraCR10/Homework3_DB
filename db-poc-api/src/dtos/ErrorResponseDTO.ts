export default interface ErrorResponseDTO {
  success: boolean;
  error: {
    code: number;
    detail: string;
  },
  timestamp: string
}
