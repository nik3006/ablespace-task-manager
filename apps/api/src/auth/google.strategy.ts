import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';

/* This strategy is used for Google OAuth authentication. 
   It uses the passport-google-oauth20 package to handle the OAuth flow and 
   retrieve the user's profile information from Google. 
   The validate method is called after the user has successfully authenticated with Google, 
   and it returns the user's profile information.*/
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ) {
    return profile;
  }
}