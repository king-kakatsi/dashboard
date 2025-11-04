export class AuthResponseDto {
  access_token: string;
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
    verified: boolean;
    provider: string;
  };
}