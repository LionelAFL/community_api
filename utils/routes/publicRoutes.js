const checkIsAdmin = require("../policies/auth.policy").checkIsAdmin;

const publicRoutes = {
  "POST /register": "AuthController.register", // alias for POST /user
  "POST /login": "AuthController.login",
  "POST /login/admin": {
    path: "AuthController.login",
    middlewares: [checkIsAdmin],
  },
  "POST /auth/password-recovery": "AuthController.sendMailPasswordRecovery",
  "POST /auth/verify-token": "AuthController.verifyResetPasswordToken",
  "PATCH /auth/reset-password": "AuthController.resetPassword",
  "POST /stripe/webhook": "StripeController.webhook",
  "POST /marketPlace/": "MarketPlaceController.getAll",
  "GET /council/events": "CouncilEventController.getAll",
  "POST /council/sendEmails": "CouncilEventController.sendEmails",
  "GET /events/": "EventController.getAllEvents",
  "GET /live-chat-controller/": "LiveChatControllers.getAll",
  "GET /challenge/get":"ChallengeController.get",
  "GET /marketPlace-categories/": "MarketplaceCategoriesController.getAll",
  "GET /event/get/:id": "EventController.getEvent",
  "GET /event/ics/:id": "EventController.downloadICS",
  "GET /channel/": "ChannelController.getAll",
  "GET /council/members/": "CouncilMembersController.getCouncilMembers",
  "GET /global-conference/ics/:id": "AnnualConferenceController.downloadICS",
  "GET /bonfire/ics/:id": "BonfireController.downloadICS",
  "GET /speakers/ics/:id": "Speakers2023Controller.downloadICS",
  "GET /category": "CategoryController.getAll",
  "GET /channel-category": "ChannelCategoryController.getAll",
  "GET /env/editor": "UserController.getEditorSignature",
  "GET /council/event/panel/:id/ics": "CouncilEventController.downloadICS",
  "GET /simulation-sprint/ics/:id": "SimulationSprintController.downloadICS",
  "GET /speakers/all-panel/:type": "Speakers2023Controller.allPanelSpeakers",
  "GET /speakers/all-users-speakers/:type":
    "Speakers2023Controller.getAllUserSpeaker",
  "GET /speakers/all-users-speakers":
    "Speakers2023Controller.getAllUserSpeaker",
  "GET /speakers/get-all-parrafs/:type": "Speakers2023Controller.getAllParraf",
  "GET /speakers/get-all-sponsor": "Speakers2023Controller.getAllSponsor",
  "GET /speakers/all-panel-of-user":
    "Speakers2023Controller.getAllPanelsOfOneUser",
  "GET /simulation-sprint-activity/ics/:id":
    "SimulationSprintActivityController.downloadICS",
  "GET /channel/forName/:name": "ChannelController.getForName",
  "GET /library/channel/": "LibraryController.getChannelLibraries",
  "GET /podcast/channel": "PodcastController.getChannelPodcasts",
  "GET /event/channel": "EventController.getChannelEvents",
  "GET /blogpost/:ChannelId": "BlogPostController.getByChannelId",
  "GET /blogpost": "BlogPostController.search",
  "GET /certificate/get-certficate-control/:code": "CertificateController.getCertificateControl",
  "POST /getPrice/": "PriceController.getPrice",
};

module.exports = publicRoutes;
