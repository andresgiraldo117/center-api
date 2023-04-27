function returnDataOrError(data, err, message){
    if(data){
        const response = data
        return { status: 200, response, message }
    }
    if(err){
        return { status: 203, response: {}, message: err.output.payload.message }
    }
}

module.exports = {
    returnDataOrError
}