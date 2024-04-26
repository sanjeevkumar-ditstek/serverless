export class Constants {
    public static stage = process.env.stage || "dev";
    public static logLevel = process.env.logLevel || "debug";
    public static secretManagerRegion = process.env.SECRET_REGION || "us-west-2";
    public static mongoURISecretKey = process.env.MONGO_URI || "com.mongo.connection.dev";
}