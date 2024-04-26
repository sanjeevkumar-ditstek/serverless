import type { Serverless } from 'serverless/aws';
// import { ServerlessConstants as constants } from './serverless-constants';
const serverlessConfiguration: Serverless = {
    service: 'user-service',
    frameworkVersion: '3',
    custom: {
        webpack: {
            webpackConfig: './webpack.config.js',
            includeModules: true
        },
        surveySecretName: {
            dev: "com.its52.survey.dev",
            prod: "com.its52.survey.dev"
        },
        prune: {
            automatic: true,
            number: 2
        }
    },
    // Add the serverless-webpack plugin
    plugins: ['serverless-webpack', 'serverless-prune-plugin', 'serverless-offline'],
    package: {
        individually: true
    },
    provider: {
        name: 'aws',
        runtime: 'nodejs20.x',
        region: "${param:region}",
        logRetentionInDays: 3,
        httpApi: {
            cors: true,
        },
        apiGateway: {
            minimumCompressionSize: 1024,
        },
        environment: {
            AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
            stage: "${param:stage}",
            MONGO_URI: "com.mongo.connection.${param:stage}"
        },
    },
    functions: {
        loginUser: {
            handler: 'src/handler/user/loginUser.loginUserHandler',
            events: [
                {
                    httpApi: {
                        method: 'post',
                        path: '/v1/login'
                    }
                },
            ],
        },
    }
}
module.exports = serverlessConfiguration;