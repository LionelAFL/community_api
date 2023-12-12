const privateRoutes = {
  "GET /user/": "UserController.getUser",
  "POST /user/apply-business-partner":
    "UserController.acceptInvitationApplyBusinessPartner",
  "POST /user/confirm-apply-business/:id":
    "UserController.confirmInvitationApplyBusiness",
  "GET /council/members/": "CouncilMembersController.getCouncilMembers",
  "GET /council/downloadExcel/:idEvent": "CouncilEventController.excelAllPanelsRegisterCouncil",
  "GET /council/resources/": "CouncilMembersController.getAll",
  "GET /council/resource/:id": "CouncilMembersController.getCouncilResource",
  "POST /council/add-resources/": "CouncilMembersController.create",
  "GET /councilComments/": "CouncilCommentController.getAll",
  "POST /councilComments/create-comment": "CouncilCommentController.add",
  "DELETE /councilComments/delete-comment/:id":
    "CouncilCommentController.remove",
  "GET /business-partner/members/":
    "BusinessPartnerController.getBusinessPartnerMembers",
  "GET /business-partner/resources/": "BusinessPartnerController.getAll",
  "GET /business-partner/resource/:id":
    "BusinessPartnerController.getBusinessPartnerResource",
  "POST /business-partner/add-resources/": "BusinessPartnerController.create",
  "DELETE /business-partner/resource/:id":
    "BusinessPartnerController.deleteResource",
  "PUT /business-partner/resource/:id":
    "BusinessPartnerController.updateResource",
  "GET /business-partner/documents/":
    "BusinessPartnerController.getBusinessPartnerDocuments",
  "POST /business-partner/create-document/":
    "BusinessPartnerController.createDocument",
  "PUT /business-partner/upload-document/":
    "BusinessPartnerController.uploadDocumentFile",
  "DELETE /business-partner/delete-document/:id":
    "BusinessPartnerController.deleteDocumentFile",
  "GET /business-partner-comments/": "BusinessPartnerCommentController.getAll",
  "POST /business-partner-comments/create-comment":
    "BusinessPartnerCommentController.add",
  "DELETE /business-partner-comments/delete-comment/:id":
    "BusinessPartnerCommentController.remove",
  "GET /events/": "EventController.getAllEvents",
  "POST /events/metadata": "EventController.eventCertificateMetaData",
  "GET /events-live/": "EventController.getLiveEvents",
  "GET /user/my-events/": "UserController.getMyEvents",
  "POST /feedback/": "FeedbackController.sendMail",
  "PUT /user/": "UserController.updateUser",
  "PUT /user/upgrade-plan/": "UserController.upgradePlan",
  "PUT /user/add-event/": "UserController.addEvent",
  "POST /files/create/": "FilesPostController.add",
  "DELETE /files/remove/:id": "FilesPostController.remove",
  "POST /files/edit/": "FilesPostController.edit",
  "GET /files/get/": "FilesPostController.get",
  "GET /files/download/:id": "FilesPostController.download",
  "PUT /user/remove-event/": "UserController.removeEvent",
  "POST /user/invite-friend/": "UserController.generateInvitationEmail",
  "GET /user/search": "UserController.searchUser",
  "PUT /user/attend-conference": "UserController.setAttendedToConference",
  "PUT /user/add-session/:id": "UserController.addSession",
  "PUT /user/remove-session/:id": "UserController.removeSession",
  "PUT /user/session-joined/:id": "UserController.sessionUserJoined",
  "PUT /user/add-bonfire/:id": "UserController.addBonfire",
  "PUT /user/remove-bonfire/:id": "UserController.removeBonfire",
  "PUT /user/upload-resume": "UserController.uploadResume",
  "PUT /user/delete-resume": "UserController.deleteResume",
  "POST /user/create-invitation": "UserController.createInvitation",
  "GET /user/accept-invitation/:newuser": "UserController.acceptInvitationJoin",
  "GET /user/confirm-accessibility-requirements/:id":
    "UserController.confirmAccessibilityRequirements",
  "PUT /event/set-status/:id": "EventController.updateEventStatus",
  "POST /stripe/checkout-session/": "StripeController.createCheckoutSession",
  "DELETE /user/delete-user/": "UserController.deleteUser",
  "GET /stripe/portal-session/": "StripeController.createPortalSession",
  "GET /stripe/subscription/": "StripeController.getSubscription",
  "GET /heart/": "HeartController.getAll",
  "GET /heart/:id": "HeartController.get",
  "POST /heart/": "HeartController.add",
  "PUT /heart/:id": "HeartController.update",
  "DELETE /heart/:id": "HeartController.remove",
  "POST /library/share": "LibraryController.share",
  "POST /library/channel": "LibraryController.create",
  "GET /library/approved/": "LibraryController.getApproved",
  "GET /library/channel/": "LibraryController.getChannelLibraries",
  "GET /library/recommendations/": "HomeController.getRecommendations",
  "GET /library/:id/": "LibraryController.getLibrary",
  "DELETE /library/delete/:id": "LibraryController.deleteLibrary",
  "PUT /library/:id/save-for-later": "LibraryController.saveForLater",
  "POST /mentoring": "MentoringController.create",
  "GET /mentoring": "MentoringController.getMentoringInfo",
  "PUT /mentoring": "MentoringController.updateMentoringInfo",
  "GET /mentor/all/": "MentoringController.getMentorList",
  "GET /mentee/all/": "MentoringController.getMenteeList",
  "PUT /mentoring/match": "MentoringController.setMatch",
  "GET /podcast/": "PodcastController.getAll",
  "GET /podcast/episode/:id": "PodcastController.get",
  "GET /podcast/search": "PodcastController.searchPodcast",
  "POST /podcast/channel": "PodcastController.add",
  "GET /podcast/channel": "PodcastController.getChannelPodcasts",
  "GET /category/:id": "CategoryController.get",
  "GET /journey/": "JourneyController.getAll",
  "GET /journey/:id": "JourneyController.get",
  "POST /journey/": "JourneyController.add",
  "PUT /journey/:id": "JourneyController.update",
  "DELETE /journey/:id": "JourneyController.remove",
  "GET /journey-items/:id": "JourneyItemController.getItemsByJourney",
  "PUT /journey-items/:id": "JourneyItemController.update",
  "GET /conference/": "ConferenceController.getAll",
  "GET /conference/:id": "ConferenceController.get",
  "PUT /conference/:id/save-for-later": "ConferenceController.saveForLater",
  "POST /channel/": "ChannelController.create",
  "GET /channel/": "ChannelController.getAll",
  "GET /channel/get-excel-all-followers-channels/:idChannel": "ChannelController.exportFollowers",
  "POST /channel/newContentEditor": "ChannelController.newContentEditor",
  "DELETE /channel/removeContentEditor/:id": "ChannelController.removeContentEditor",
  "GET /channel/getContentEditor/:id": "ChannelController.getContentEditor",
  "GET /channel/:id": "ChannelController.get",
  "GET /channel-category/:id": "ChannelCategoryController.get",
  "POST /event/channel": "EventController.create",
  "POST /email/notfication/channel": "ChannelController.emailNotification",
  "POST /email/attendee/channel": "ChannelController.emailAttendee",
  "POST /email/attendee/event": "EventController.emailAttendee",
  "POST /certificate/add-certificate-control": "CertificateController.addCertificateControl",
  "POST /certificate/get-code-certificate": "CertificateController.getCodeCertificate",
  "GET /certificate/get-certficate-control/:code": "CertificateController.getCertificateControl",
  "GET /certificate/get-all-certficate-type/:type": "CertificateController.getAllTypeCertificateControl",
  "PUT /user/update-popup": "UserController.updateUserPopup",
  "GET /event/channel": "EventController.getChannelEvents",
  "GET /channel/forName/:name": "ChannelController.getForName",
  "DELETE /library/channel/:id": "LibraryController.deleteChannelLibrary",
  "PUT /library/channel/:id": "LibraryController.update",
  "PUT /library/orderLibrary": "LibraryController.orderLibrariesFunction",
  "PUT /library/viewed": "LibraryController.markAsViewed",
  "DELETE /podcast/channel/:id": "PodcastController.deleteChannelPodcast",
  "PUT /podcast/channel/:id": "PodcastController.update",
  "PUT /podcast/viewed": "PodcastController.markAsViewed",
  "PUT /podcast/:id/save-for-later": "PodcastController.saveForLater",
  "DELETE /event/channel/:id": "EventController.deleteChannelEvent",
  "PUT /event/:id": "EventController.updateEvent",
  "GET /events/channels": "EventController.getAllEventsChannels",
  "PUT /event/user-assistence/:id": "EventController.updateEventUserAssistence",
  "PUT /event/channel/:id": "EventController.updateEvent",
  "PUT /channel/follow/:id": "ChannelController.setFollow",
  "PUT /channel/unfollow/:id": "ChannelController.unsetFollow",
  "PUT /channel/:id": "ChannelController.put",
  "PUT /event/reset-email-reminders": "EventController.resetEmailReminders",
  "GET /courses/": "CourseController.getAll",
  "GET /course/:id": "CourseController.get",
  "POST /course/claim": "CourseController.claim",
  "GET /course-classes/:course": "CourseClassController.getByCourse",
  "GET /session": "AnnualConferenceController.getAll",
  "GET /sessions-user": "AnnualConferenceController.getSessionsUser",
  "GET /sessions-user-joined":
    "AnnualConferenceController.getSessionsUserJoined",
  "GET /session/participants": "AnnualConferenceController.getParticipants",
  "GET /session/recommended-agenda":
    "AnnualConferenceController.recommendedAgenda",
  "POST /session/claim": "AnnualConferenceController.claim",
  "PUT /session/viewed": "AnnualConferenceController.markAsViewed",
  "GET /session/:id": "AnnualConferenceController.get",
  "PUT /session/:id/save-for-later": "AnnualConferenceController.saveForLater",
  "GET /conference-classes/:conference":
    "AnnualConferenceClassController.getByAnnualConference",
  "POST /live-chat-create/": "LiveChatControllers.add",
  "POST /live-chat-update/": "LiveChatControllers.update",
  "DELETE /live-chat-remove/:id": "LiveChatControllers.remove",
  "POST /live-chat-order/": "LiveChatControllers.order",
  "GET /conference-classes-user/:conference":
    "AnnualConferenceClassUserController.getProgressAnnualConferenceByUser",
  "GET /challenge/get":"ChallengeController.get",
  "POST /challenge/send":"ChallengeController.sendD",
  "GET /challenge/getone/:id":"ChallengeController.getOne",
  "POST /challenge/add":"ChallengeController.add",
  "PUT /challenge/edit/":"ChallengeController.edit",
  "DELETE /challenge/remove/:id":"ChallengeController.remove",
  "GET /challenge/download":"ChallengeController.download",
  "POST /challenge/join":"ChallengeController.joinOrLeave",
  "POST /verify/suscribed-user":"EventController.verifyUserSuscribeSendingBlue",
  "POST /suscribed-user":"EventController.suscriptionSendingBlue2",
  "POST /conference-classes-user/":
    "AnnualConferenceClassUserController.setProgress",
  "GET /course-instructors/:course": "CourseController.getInstructorsByCourse",
  "GET /course-sponsors/:course": "CourseController.getSponsorsByCourse",
  "GET /notification": "NotificationController.getAll",
  "PUT /notification/mark-to-read":
    "NotificationController.setNotificationsRead",
  "PUT /notification/mark-to-un-read":
    "NotificationController.setNotificationsUnRead",
  "GET /course-classes-user/:course":
    "CourseClassUserController.getProgressCourseByUser",
  "POST /course-classes-user/": "CourseClassUserController.setProgress",
  "GET /live/": "LiveController.get",
  "GET /podcast-series": "PodcastSeriesController.getAll",
  "GET /podcast-series/:id": "PodcastSeriesController.get",
  "POST /podcast-series/claim": "PodcastSeriesController.claim",
  "POST /library/claim": "LibraryController.claim",
  "POST /conference/claim": "ConferenceController.claim",
  "POST /event/claim-credit": "EventController.claimCredit",
  "POST /event/claim-attendance": "EventController.claimAttendance",
  "PUT /conference/viewed": "ConferenceController.markAsViewed",
  "PUT /podcast-series/viewed": "PodcastSeriesController.markAsViewed",
  "PUT /podcast-series/:id/save-for-later":
    "PodcastSeriesController.saveForLater",
  "GET /post/": "PostController.getAll",
  "GET /post/:id": "PostController.get",
  "GET /posts/search": "PostController.searchPost",
  "POST /post/": "PostController.add",
  "PUT /post/:id": "PostController.update",
  "DELETE /post/:id": "PostController.remove",
  "POST /postLike/": "PostLikeController.add",
  "POST /event-bul-close/": "EventController.activeOrCloseRegisterEvent",
  "DELETE /postLike/:id": "PostLikeController.remove",
  "POST /postFollow/": "PostFollowController.add",
  "DELETE /postFollow/:id": "PostFollowController.remove",
  "GET /postComment/": "PostCommentController.getAll",
  "POST /postComment/": "PostCommentController.add",
  "GET /challengeComment/": "ChallengeController.getAllComment",
  "GET /admin-business-user/" : "BusinessPartnerController.getBusinessPartnerMembersAdmin",
  "POST /challengeComment/": "ChallengeController.addComment",
  "DELETE /challengeComment/:id": "ChallengeController.removeComment",
  "GET /challenge-get-status/": "ChallengeController.getStatus",
  "POST /challenge-status/": "ChallengeController.setStatus",
  "DELETE /postComment/:id": "PostCommentController.remove",
  "POST /project": "ProjectController.create",
  "GET /project": "ProjectController.getAll",
  "GET /project/:id": "ProjectController.get",
  "POST /bonfire": "BonfireController.create",
  "GET /bonfire": "BonfireController.getAll",
  "GET /bonfire/:id": "BonfireController.get",
  "PUT /bonfire/:id": "BonfireController.update",
  "PUT /bonfire/:id/invitedUser/:userId": "BonfireController.inviteUser",
  "DELETE /bonfire/:id": "BonfireController.remove",
  "GET /bonfire-download/:id": "BonfireController.exportUsersToCSV",
  "GET /bonfire-participant-download/:id":
    "BonfireController.exportParticipantBonfireToCSV",
  "POST /speakers/set-status-user": "Speakers2023Controller.setStatusUserConference",
  "GET /speakers/get-status-user": "Speakers2023Controller.getStatusUserConference",
  "GET /skill-cohort": "SkillCohortController.getAllActiveUserSide",
  "GET /skill-cohort/my-cohort/:UserId":
    "SkillCohortController.getAllOfMyCohort",
  "GET /skill-cohort/:id": "SkillCohortController.get",
  "GET /skill-cohort/:skillCohortId/resources":
    "SkillCohortResourcesController.getAllAndCount",
  "GET /skill-cohort/resources/:skillCohortId/entire":
    "SkillCohortResourcesController.getEntire",
  "GET /skill-cohort/resource/:resourceId":
    "SkillCohortResourcesController.get",
  "GET /skill-cohort/:SkillCohortId/resource/":
    "SkillCohortResourcesController.getTodaysResource",
  "POST /skill-cohort/participant": "SkillCohortParticipantController.create",
  "GET /skill-cohort/:skillCohortId/participant/:userId":
    "SkillCohortParticipantController.get",
  "GET /skill-cohort/:SkillCohortId/participants/":
    "SkillCohortParticipantController.getAll",
  "GET /skill-cohort/participant/:userId":
    "SkillCohortParticipantController.getParticipantInAllCohortById",
  "DELETE /skill-cohort/participant/:SkillCohortParticipantId":
    "SkillCohortParticipantController.withdrawParticipation",
  "POST /skill-cohort/resource/:resourceId/response":
    "SkillCohortResourceResponseController.create",
  "PUT /skill-cohort/response/:responseId":
    "SkillCohortResourceResponseController.update",
  "GET /skill-cohort/resource/:resourceId/participant/:participantId/response":
    "SkillCohortResourceResponseController.get",
  "GET /skill-cohort/resource/:resourceId/responses/:participantId":
    "SkillCohortResourceResponseController.getAllExceptCurrentUser",
  "POST /skill-cohort/response/assessment":
    "SkillCohortResourceResponseAssessmentController.create",
  "GET /skill-cohort/resource/:resourceId/participant/:participantId/assessments":
    "SkillCohortResourceResponseAssessmentController.getAllAssessmentByIds",
  "POST /skill-cohort/resource/assessment/upsert":
    "SkillCohortResourceResponseAssessmentController.upsertAssessment",
  "POST /skill-cohort/response/rating":
    "SkillCohortResponseRatingController.upsert",
  "GET /skill-cohort/resource/:resourceId/participant/:participantId/ratings":
    "SkillCohortResponseRatingController.getAllByIds",
  "POST /user/:UserId/change-password": "UserController.changePassword",
  "GET /my-learnings/saved": "LearningController.getAllSaved",
  "GET /my-learnings/completed": "LearningController.getAllCompleted",
  "GET /my-learnings/items-with-hr-credits":
    "LearningController.getAllItemsWithHrCredit",
  "GET /my-learnings/event-videos": "LearningController.getAllEventVideos",
  "POST /verify-code-event-add": "EventWorkshopVerifyController.add",
  "GET /verify-code-event-get": "EventWorkshopVerifyController.get",
  "GET /my-learnings/event-libraris-videos": "LearningController.getAllLibraries",
  "GET /learning-badges": "LearningBadgeController.getAll",
  "GET /partner": "PartnerController.getAll",
  "GET /partner/:id": "PartnerController.get",
  "GET /users": "UserController.getAllUsersExcludePassword",
  "GET /job-board/job-posts": "JobPostController.getAll",
  "GET /job-board/job-post/:JobPostId": "JobPostController.getJobPost",
  "POST /job-board/job-post": "JobPostController.upsert",
  "GET /job-board/my-job-posts": "JobPostController.getMyJobPosts",
  "POST /job-board/invitation-to-apply": "JobPostController.invitationToApply",
  "GET /marketplace-profiles": "MarketplaceProfileController.getAll",
  "POST /marketplace-profiles": "MarketplaceProfileController.add",
  "GET /marketplace-profiles/:id": "MarketplaceProfileController.get",
  "PUT /marketplace-profiles/:id": "MarketplaceProfileController.update",
  "POST /conversations": "ConversationController.create",
  "GET /conversation/:conversationId": "ConversationController.get",
  "GET /conversations/:userId": "ConversationController.getAll",
  "PUT /conversation/:conversationId":
    "ConversationController.hideConversation",
  "POST /messages/": "MessageController.create",
  "GET /messages/:conversationId": "MessageController.getAll",
  "PUT /messages/:ConversationId": "MessageController.readMessages",
  "GET /more-messages/:ConversationId": "MessageController.getMoreMessages",
  "PUT /user/accept-terms-condition-g-conference/:id":
    "UserController.acceptTermsConditionGConference",
  "PUT /user/view-rules-g-conference/:id":
    "UserController.viewRulesGConference",
  "GET /users/count-all": "UserController.countAllUsers",
  "GET /ads-by-page": "AdvertisementController.getAdvertisementsTodayByPage",
  "GET /ads/active": "AdvertisementController.getAllActiveAdvertisements",
  "GET /ads/:UserId": "AdvertisementController.getAdvertisementByAdvertiser",
  "POST /ad": "AdvertisementController.createAdvertisement",
  "GET /ad/:advertisementId": "AdvertisementController.getAdvertisementById",
  "GET /matchmake": "MatchmakingController.getMatchmake",
  "PUT /ad/:AdvertisementId": "AdvertisementController.editAdvertisement",
  "POST /ad/click": "AdvertisementController.createAdvertisementClick",
  "POST /matchmake/send-email": "MatchmakingController.sendMatchEmail",
  "POST /council/event": "CouncilEventController.createOrEditConcil",
  "GET /council/events": "CouncilEventController.getAll",
  "DELETE /council/event/:id": "CouncilEventController.destroy",
  "POST /council/event/panelist":
    "CouncilEventController.joinCouncilEventPanelist",
  "POST /council/event/await/panelist":
    "CouncilEventController.joinCouncilEventAwaitPanelist",
  "POST /my-learnings/set-all-hr-credits":
    "LearningController.setAllMyHrCreditse",
  "GET /my-learnings/get-all-hr-credits":
    "LearningController.getAllMyHrCreditse",
  "POST /council-conversation": "CouncilConversationController.upsert",
  "GET /council-conversations": "CouncilConversationController.getAll",
  "GET /council-conversation/:id": "CouncilConversationController.get",
  "DELETE /council-conversation/:id": "CouncilConversationController.destroy",
  "POST /council-conversation/comment":
    "CouncilConversationCommentController.upsert",
  "POST /council-conversation/reply":
    "CouncilConversationReplyController.upsert",
  "PUT /council-conversation/comment/:id":
    "CouncilConversationCommentController.destroy",
  "PUT /council-conversation/reply/:id":
    "CouncilConversationReplyController.destroy",
  "POST /council-conversation/like": "CouncilConversationLikeController.create",
  "DELETE /council-conversation/like/:id":
    "CouncilConversationLikeController.destroy",
  "DELETE /council/event/panel/:CouncilEventPanelId/panelist/:CouncilEventPanelistId":
    "CouncilEventController.removePanelist",
  "GET /council/event/search-user": "CouncilEventController.search",
  "POST /council/event/panel/comment": "CouncilEventController.upsertComment",
  "POST /user/email-authorization-speakers2023":
    "UserController.sendEmailAuthorizationSpeakersEndPoint",
  "POST /user/email-authorization-action-speakers2023":
    "UserController.sendActiveOrDenyAuthorizationEndPoint",
  "POST /speakers/add-new-panel": "Speakers2023Controller.addNewPanelSpeaker",
  "POST /speakers/add-speaker-to-panel":
    "Speakers2023Controller.addUserSpeakerToPanel",
  "POST /user/renew-suscription-status": "UserController.updateRenewSuscriptionUser",
  "POST /user/get/suscription-status": "UserController.checkMembresi",
  "POST /speakers/remove-user-panel":
    "Speakers2023Controller.removeUserSpeakerToPanel",
  "GET /speakers/get-one-panel/:id": "Speakers2023Controller.panelForId",
  "POST /speakers/edit-panel": "Speakers2023Controller.editPanelsSpeaker2023",
  "POST /speakers/changue_status": "Speakers2023Controller.changueStatus",
  "POST /speakers/edit-authorzation-speakers-admin":
    "Speakers2023Controller.editAuthorizationSpeakers",
  "DELETE /speakers/delete-panel/:PanelId":
    "Speakers2023Controller.deletePanelsSpeaker2023",
  "POST /speakers/send-email-register-conference":
    "Speakers2023Controller.registerUserIfNotAreRegisterConference2023",
  "GET /speakers/get-excel-all-person-register":
    "Speakers2023Controller.excelAllUserRegisterConference2023",
  "GET /speakers/all-panel/:type": "Speakers2023Controller.allPanelSpeakers",
  "GET /speakers/all-users-speakers/:type":
    "Speakers2023Controller.getAllUserSpeaker",
  "GET /speakers/all-users-speakers":
    "Speakers2023Controller.getAllUserSpeaker",
  "GET /speakers/get-excel-all-user-speakers":
    "Speakers2023Controller.excelAllsersSpeakersAndPanels",
  "GET /speakers/get-member-speakers-of-one-user":
    "Speakers2023Controller.allMemberSpeakerToPanel",
  "POST /speakers/add-new-speakers-admin":
    "Speakers2023Controller.addNewSpeakersAdmin",
  "GET /speakers/all-panel-of-user":
    "Speakers2023Controller.getAllPanelsOfOneUser",
  "GET /speakers/all-my-panel-of-user": "Speakers2023Controller.getAllMyPanels",
  "POST /speakers/add-new-speakers-admin":
    "Speakers2023Controller.addNewSpeakersAdmin",
  "POST /speakers/add-speaker-to-panel":
    "Speakers2023Controller.addUserSpeakerToPanel",
  "POST /speakers/remove-user-panel":
    "Speakers2023Controller.removeUserSpeakerToPanel",
  "POST /speakers/send-email-register-conference":
    "Speakers2023Controller.registerUserIfNotAreRegisterConference2023",
  "GET /speakers/get-excel-all-person-register":
    "Speakers2023Controller.excelAllUserRegisterConference2023",
  "GET /speakers/get-excel-all-panels-register":
    "Speakers2023Controller.excelAllPanelsRegisterConference2023",
  "POST /blogpost": "BlogPostController.create",
  "GET /blogpost": "BlogPostController.search",
  "GET /blogpost/blog/:blogPostId": "BlogPostController.getBlogPost",
  "GET /blogpost/:ChannelId": "BlogPostController.getByChannelId",
  "PUT /blogpost/:blogPostId": "BlogPostController.update",
  "DELETE /blogpost/:blogPostId": "BlogPostController.remove",
  "POST /blogPostLike/": "BlogPostLikeController.add",
  "DELETE /blogPostLike/:id": "BlogPostLikeController.remove",
  "POST /speakers/add-sponsor": "Speakers2023Controller.addSponsor",
  "GET /speakers/get-all-sponsor": "Speakers2023Controller.getAllSponsor",
  "GET /speakers/get-one-sponsor/:SponsorId":
    "Speakers2023Controller.getOneSponsor",
  "POST /speakers/edit-sponsor": "Speakers2023Controller.editSponsor",
  "DELETE /speakers/delete-sponsor/:SponsorId":
    "Speakers2023Controller.deleteSponsor",
  "POST /speakers/add-parraf": "Speakers2023Controller.addParraf",
  "GET /speakers/get-all-parraf": "Speakers2023Controller.getAllParraf",
  "GET /speakers/get-one-parraf/:ParrafId":
    "Speakers2023Controller.getOneParraf",
  "POST /speakers/added-to-agenda":
    "Speakers2023Controller.addToMyPersonalAgenda",
  "DELETE /speakers/delete-parraf/:ParrafId":
    "Speakers2023Controller.deleteParraf",
  "POST /channel/add-email-draft": "ChannelController.addDraftEmail",
  "GET /channel/get-all-email-draft/:id": "ChannelController.getAllDraftEmail",
  "GET /event/searh-user/:id": "EventController.searchUserEvents",
  "GET /channel/get-all-email-send/:id": "ChannelController.getAllSendEmail",
  "POST /channel/edit-email-draft": "ChannelController.editDraftEmail",
  "POST /channel/copy-email-send": "ChannelController.copyEmailAttendee",
  "POST /event/add-email-draft": "EventController.addDraftEmail",
  "GET /event/get-all-email-draft/:id": "EventController.getAllDraftEmail",
  "GET /event/get-all-email-send": "EventController.getAllSendEmail",
  "DELETE /event/delete-email-draft/:draftEmailId":
    "EventController.deleteDraftEmail",
  "POST /email/attendee/council": "CouncilEventController.emailAttendee",

  "POST /conference2/add-email-draft": "Speakers2023Controller.addDraftEmail",
  "GET /conference2/get-all-email-draft": "Speakers2023Controller.getAllDraftEmail",
  "GET /conference2/get-all-conference-send": "Speakers2023Controller.getAllSendEmail",
  "DELETE /conference2/delete-email-draft/:draftEmailId":
    "Speakers2023Controller.deleteDraftEmail",
  "POST /email2/attendee/conference": "Speakers2023Controller.emailAttendee",
  "GET /email2/allUserConference": "Speakers2023Controller.searchUserConference",

  "GET /council/get-all-email-draft/:id": "CouncilEventController.getAllDraftEmail",
  "GET /council/get-all-email-send": "CouncilEventController.getAllSendEmail",
  "POST /email/attendee/council": "CouncilEventController.emailAttendee",
  "GET /council/searh-user/:id": "CouncilEventController.searchUserEvents",
  "POST /council/add-email-draft": "CouncilEventController.addDraftEmail",
  "DELETE /council/delete-email-draft/:draftEmailId":
    "CouncilEventController.deleteDraftEmail",
  "DELETE /channel/delete-email-draft/:draftEmailId":
    "ChannelController.deleteDraftEmail",
  "POST /speakers/edit-parraf": "Speakers2023Controller.editParraf",
  "POST /event22/changue-status-popup": "EventController.changueEventStatusPopup",
  "GET /simulation-sprints": "SimulationSprintController.getAll",
  "GET /simulation-sprints/:id": "SimulationSprintController.get",
  "GET /simulation-sprint-deliverable/:id":
    "SimulationSprintDeliverableController.get",
  "GET /simulation-sprint/:id/deliverables":
    "SimulationSprintDeliverableController.getAll",
  "GET /simulation-sprint-activity/:id":
    "SimulationSprintActivityController.get",
  "GET /simulation-sprint/:id/activities":
    "SimulationSprintActivityController.getAll",
  "GET /simulation-sprint/resource/:id":
    "SimulationSprintResourcesController.get",
  "POST /simulation-sprint/participant":
    "SimulationSprintParticipantController.create",
  "GET /simulation-sprint/participant/:SimulationSprintId":
    "SimulationSprintParticipantController.getParticipantsBySimulationSprint",
  "GET /simulation-sprint/group/:id": "SimulationSprintGroupController.get",
  "GET /simulation-sprint-by-user":
    "SimulationSprintController.getSimulationSprintByUser",
  "PUT /users/handle-receive-community-notification":
    "UserController.handleReceiveCommunityNotification",
};

module.exports = privateRoutes;
