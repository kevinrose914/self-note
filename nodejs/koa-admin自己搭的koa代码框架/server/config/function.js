// private function
module.exports = {
    _errorResponse: (ctx, status, msg) => {
        ctx.response.status = status;
        ctx.response.message = msg;
    },
    _successResponse: (ctx, isOk, msg, data) => {
        if (isOk) {
            ctx.response.body = {
                success: true,
                data: data,
                message: msg
            }
        } else {
            ctx.response.body = {
                success: false,
                message: msg
            }
        }
    }
};