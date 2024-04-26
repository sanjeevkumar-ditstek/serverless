export class ApiResponse {

    public setResponse( statusCode: number, body: any, headers: any ) {

        let response;
        if (!headers) {
            headers = {};
        }

        if (!headers.hasOwnProperty('Content-Type')) {
            headers["Content-Type"] = "application/json";
        }

        if (typeof body !== "string") {
            body = JSON.stringify(body, null, 2)
        }

        response = {
            "isBase64Encoded": false,
            "statusCode": statusCode,
            "headers": headers,
            "body": body
        };

        //console.log("response here is ", response);
        return response;


    }

}