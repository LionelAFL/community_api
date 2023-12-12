const adminRoutes = {
  "GET /user-by-id/:id": "UserController.getUserById",
  "PUT /user-by-id/:id": "UserController.updateUserAdmin",
  "POST /event/": "EventController.create",
  "PUT /event/:id": "EventController.updateEvent",
  "GET /event/:id/users": "EventController.getEventUsers",
  "GET /event/:id/": "EventController.getEventAdmin",
  "DELETE /event/:id": "EventController.remove",
  "PUT /event/send-message/:id": "EventController.sendMessageToParticipants",
  "PUT /event/send-test-message/:id": "EventController.sendTestMessage",
  "GET /podcast/:id": "PodcastController.get",
  "POST /podcast/": "PodcastController.add",
  "PUT /podcast/:id": "PodcastController.update",
  "DELETE /podcast/:id": "PodcastController.remove",
  "GET /marketplace/:id": "MarketPlaceController.get",
  "POST /marketplace/": "MarketPlaceController.add",
  "PUT /marketplace/:id": "MarketPlaceController.update",
  "DELETE /marketplace/:id": "MarketPlaceController.remove",
  "GET /marketplace-categories/:id": "MarketplaceCategoriesController.get",
  "POST /marketplace-categories/": "MarketplaceCategoriesController.add",
  "PUT /marketplace-categories/:id": "MarketplaceCategoriesController.update",
  "DELETE /marketplace-categories/:id":
    "MarketplaceCategoriesController.remove",
  "GET /library/all/": "LibraryController.getAll",
  "POST /library/": "LibraryController.create",
  "PUT /libraryOk/:id": "LibraryController.update",
  "PUT /library/approve/:id": "LibraryController.approve",
  "PUT /library/reject/:id": "LibraryController.reject",
  "PUT /library/recommend/:id": "LibraryController.recommend",
  "POST /category": "CategoryController.create",
  "PUT /category/:id": "CategoryController.update",
  "DELETE /category/:id": "CategoryController.remove",
  "GET /user/all": "UserController.getAll",
  "GET /user/channels-owners": "UserController.getAllUsersChannelOwner",
  "GET /session/users": "UserController.getSessionUsers",
  "PUT /session/user-remove/:id": "UserController.removeSessionUser",
  "GET /conference/:id/": "ConferenceController.get",
  "POST /conference/": "ConferenceController.create",
  "PUT /conference/:id": "ConferenceController.update",
  "DELETE /conference/:id": "ConferenceController.remove",
  "POST /channel-category": "ChannelCategoryController.create",
  "PUT /channel-category/:id": "ChannelCategoryController.update",
  "DELETE /channel-category/:id": "ChannelCategoryController.remove",
  "POST /session": "AnnualConferenceController.create",
  "PUT /session/:id": "AnnualConferenceController.update",
  "DELETE /session/:id": "AnnualConferenceController.remove",
  "POST /session/send-message": "AnnualConferenceController.sendMessage",
  "GET /conference-classes/": "AnnualConferenceClassController.getAll",
  "POST /conference-classes/": "AnnualConferenceClassController.add",
  "PUT /conference-classes/:id": "AnnualConferenceClassController.update",
  "DELETE /conference-classes/:id": "AnnualConferenceClassController.remove",
  "GET /courses/": "CourseController.getAllAdmin",
  "GET /course/:id": "CourseController.get",
  "POST /course/": "CourseController.add",
  "PUT /course/:id": "CourseController.update",
  "DELETE /course/:id": "CourseController.remove",
  "POST /course-classes/": "CourseClassController.add",
  "PUT /course-classes/:id": "CourseClassController.update",
  "DELETE /course-classes/:id": "CourseClassController.remove",
  "GET /sponsors/": "SponsorController.getAll",
  "GET /sponsor/:id": "SponsorController.get",
  "POST /sponsor/": "SponsorController.add",
  "PUT /sponsor/:id": "SponsorController.update",
  "DELETE /sponsor/:id": "SponsorController.remove",
  "GET /instructors/": "InstructorController.getAll",
  "GET /instructor/:id": "InstructorController.get",
  "POST /instructor/": "InstructorController.add",
  "PUT /instructor/:id": "InstructorController.update",
  "DELETE /instructor/:id": "InstructorController.remove",
  "POST /live/": "LiveController.save",
  "POST /podcast-series": "PodcastSeriesController.create",
  "PUT /podcast-series/:id": "PodcastSeriesController.update",
  "DELETE /podcast-series/:id": "PodcastSeriesController.remove",
  "PUT /project/:id": "ProjectController.update",
  "DELETE /project/:id": "ProjectController.remove",
  "PUT /bonfire/:id": "BonfireController.update",
  "DELETE /bonfire/:id": "BonfireController.remove",
  "POST /skill-cohort": "SkillCohortController.create",
  "POST /skill-cohort/duplicate": "SkillCohortController.duplicate",
  "GET /skill-cohort": "SkillCohortController.getAll",
  "DELETE /skill-cohort/:id": "SkillCohortController.remove",
  "PUT /skill-cohort/:id": "SkillCohortController.update",
  "GET /skill-cohort/:skillCohortId/resources":
    "SkillCohortResourcesController.getAll",
  "POST /skill-cohort/resource": "SkillCohortResourcesController.create",
  "POST /skill-cohort/resources": "SkillCohortResourcesController.batchWrite",
  "POST /challenge/resources": "ChallengeController.batchWrite",
  "DELETE /skill-cohort/resource/:resourceId":
    "SkillCohortResourcesController.remove",
  "PUT /skill-cohort/resource/:resourceId":
    "SkillCohortResourcesController.update",
  "GET /skill-cohort/:cohortId/groupings/:currentWeekNumber":
    "SkillCohortGroupingsController.getAll",
  "GET /skill-cohort/grouping/:groupId": "SkillCohortGroupingsController.get",
  "PUT /skill-cohort/grouping/:groupId":
    "SkillCohortGroupingsController.update",
  "GET /skill-cohort/participants/export-all":
    "SkillCohortParticipantController.exportAllSkillCohortParticipantData",
  "POST /partner/": "PartnerController.add",
  "PUT /partner/:id": "PartnerController.update",
  "DELETE /partner/:id": "PartnerController.remove",
  "GET /session/get-users-joined/:id":
    "AnnualConferenceController.getUsersJoinedSession",
  "GET /get-partners": "UserController.getAllBusinessPartner",
  "GET /get-partners-search": "UserController.getAllBusinessPartnerSearch",
  "POST /add-permission-partners": "UserController.addBusinessPartner",
  "POST /remove-permission-partners": "UserController.removeBusinessPartner",
  "POST /simulation-sprints": "SimulationSprintController.create",
  "PUT /simulation-sprints/:id": "SimulationSprintController.update",
  "DELETE /simulation-sprints/:id": "SimulationSprintController.remove",
  "POST /simulation-sprints/duplicate": "SimulationSprintController.duplicate",
  "POST /simulation-sprint/deliverable":
    "SimulationSprintDeliverableController.create",
  "PUT /simulation-sprint/deliverable/:id":
    "SimulationSprintDeliverableController.update",
  "DELETE /simulation-sprint/deliverable/:id":
    "SimulationSprintDeliverableController.remove",
  "GET /simulation-sprint/:SimulationSprintId/resources":
    "SimulationSprintResourcesController.getAll",
  "POST /simulation-sprint/resource":
    "SimulationSprintResourcesController.create",
  "PUT /simulation-sprint/resource/:id":
    "SimulationSprintResourcesController.update",
  "DELETE /simulation-sprint/resource/:id":
    "SimulationSprintResourcesController.remove",
  "POST /simulation-sprint/activity":
    "SimulationSprintActivityController.create",
  "PUT /simulation-sprint/activity/:id":
    "SimulationSprintActivityController.update",
  "DELETE /simulation-sprint/activity/:id":
    "SimulationSprintActivityController.remove",
  "POST /simulation-sprint/group": "SimulationSprintGroupController.create",
  "PUT /simulation-sprint/group/:id": "SimulationSprintGroupController.update",
  "DELETE /simulation-sprint/group/:id":
    "SimulationSprintGroupController.remove",
};

module.exports = adminRoutes;
