const { Router } = require('express');
const routesAuth = require('./Auth.routes');
const routesAccounts = require('./Accounts.routes');
const routesUsers = require('./User.routes');
const routesBoards = require('./Boards.routes');
const routesPayments = require('./Payments.routes');
const routesLogs = require('./Logs.routes');
const routesLeads = require('./Leads.routes');
const routesPauta = require('./Pauta.routes');
const routesCategory = require('./Category.routes');
const routesPermissions = require('./Permissions.routes');
const routesConfigurationAccount = require('./ConfigurationAcc.routes');
const routesFormat = require('./Format.routes');
const routesTranssactions = require('./Transsactions.routes');
const routesNotifications = require('./Notifications.routes');
const routesFiles = require('./Files.routes');
const routesCampaign = require('./Campaigns.routes');
const routesGConfig = require('./GeneralConfiguration.routes');
const routesFormLeads = require('./FormLeads.routes');
const routesLanding = require('./Landing.routes');
const router = Router();    


router.use('/api/auth', routesAuth);
router.use('/api/accounts', routesAccounts);
router.use('/api/users', routesUsers);
router.use('/api/boards', routesBoards);
router.use('/api/payments', routesPayments);
router.use('/api/logs', routesLogs);
router.use('/api/leads', routesLeads);
router.use('/api/pauta', routesPauta);
router.use('/api/category', routesCategory);
router.use('/api/permissions', routesPermissions );
router.use('/api/configuration', routesConfigurationAccount );
router.use('/api/format', routesFormat );
router.use('/api/transsactions', routesTranssactions );
router.use('/api/notifications', routesNotifications );
router.use('/api/files', routesFiles );
router.use('/api/campaign', routesCampaign );
router.use('/api/generalconfiguration', routesGConfig );
router.use('/api/formleads', routesFormLeads );
router.use('/api/landing', routesLanding );



module.exports = router;