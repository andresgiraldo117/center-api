const Permissions = require('../models/Permissions');   

async function validatePermission(user, action){
    const permissionsDb = await Permissions.find({nameRole : user.role});
    let actionValidated = permissionsDb[0].listPermissions.find(ele => ele.action === action);
    console.log('actionValidated :>> ', actionValidated);
    if(actionValidated && actionValidated.status === 'true') return true;
    else{ return false }
}

module.exports = {  
    validatePermission
}