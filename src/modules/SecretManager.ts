"use strict";

import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { getLogger, Logger } from "log4js";

import { Constants as constants } from '../utils/Constants';

export class AWSSecretManager {


  constructor() {
    console.log("AWSSecretManager",constants.secretManagerRegion);
    this.secretMaangerClient = new SecretsManagerClient({ region: constants.secretManagerRegion })
    this.logger = getLogger();
    this.logger.level = constants.logLevel;
    this.decrypted = {};
  }

  protected secretMaangerClient;
  protected logger: Logger;
  protected decrypted: any;


  public async decryptSecret(secretName: string, key: string) {

    try {

      let secret;

      if (this.decrypted[secretName]) {
        return this.returnSecret(secretName, this.decrypted[secretName], key);
      } else {
       
        const secretResponse: any = await this.getAwsSecret(secretName);

        if ('SecretString' in secretResponse) {
          secret = secretResponse.SecretString;
        } else {
          let buff = Buffer.from(secretResponse.SecretBinary, 'base64');
          secret = buff.toString('ascii');
        }

        secret = JSON.parse(secret);
        return this.returnSecret(secretName, secret, key);

      }

    } catch (err) {
      this.logger.error("Error retrieving secret ", err)
      throw new Error("error getting secret")
    }

  };

  protected async returnSecret(secretName: string, secret: string, key: any) {

    this.decrypted[secretName] = secret;

    if (secret[key]) {
      return secret[key];
    } else if (secret) {
      return secret;
    } else {
      throw new Error(`Key ${key} was not found in secret ${secretName}`)
    }
  }

  protected async getAwsSecret(secretName: string) {
    try {
      const command = new GetSecretValueCommand({ SecretId: secretName,VersionStage: "AWSCURRENT"  });
      const data = await this.secretMaangerClient.send(command);        
      console.log("data received",data);
      return data;
    } catch (error) {
      console.log("I am not found");
        console.log("error while fetching secret",error);      
    }

  }


}





