export interface QTResponse<T = {}> {
  actionname: string;
  response: {
    status: "ok" | "error";
    data: T;
  };
  arguments?: T;
}

export interface QTErrorMessage {
  errormessage: string;
}

export interface QTRequest {
  actionname: string;
  arguments?: {};
}

export interface LoginResponsePayload {
  accessToken: string;
  userId: string;
  userName: string;
}

export interface QTErrorData {
  errormessage: string;
  errornumber?: number;
}
