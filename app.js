const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mapRoutes = require("express-routes-mapper");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const authPolicy = require("./policies/auth.policy");
const cron = require("node-cron");
const EventController = require("./controllers/EventController");
// const JourneyController = require("./controllers/JourneyController");
const fileUpload = require("express-fileupload");
const SkillCohortResourcesController = require("./controllers/SkillCohortResourcesController");
const SkillCohortParticipantController = require("./controllers/SkillCohortParticipantController");
const NotificationController = require("./controllers/NotificationController");
const SkillCohortGroupingsController = require("./controllers/SkillCohortGroupingsController");
const SkillCohortController = require("./controllers/SkillCohortController");
const SkillCohortResourceResponseController = require("./controllers/SkillCohortResourceResponseController");
const UserController = require("./controllers/UserController");
const WeeklyDigestController = require("./controllers/WeeklyDigestController");
const MatchmakingController = require("./controllers/MatchmakingController");
const MatchController = require("./controllers/MatchController");
const MessageController = require("./controllers/MessageController");
const BusinessPartnerController = require("./controllers/BusinessPartnerController");
const AdvertisementController = require("./controllers/AdvertisementController");
const CouncilEventController = require("./controllers/CouncilEventController");
const BlogPostController = require("./controllers/BlogPostController");
const smtpService = require("./services/smtp.service");
const socketService = require("./services/socket.service");

const moment = require("moment-timezone");

const { LabEmails } = require("./enum");

dotenv.config();

/**
 * server configuration
 */
const routes = require("./routes");
const SocketEventTypes = require("./enum/SocketEventTypes");
const PodcastController = require("./controllers/PodcastController");
const LibraryController = require("./controllers/LibraryController");
const sendInBlueService = require("./services/sendinblue.service");

/**
 * express application
 */
const app = express();
const mappedOpenRoutes = mapRoutes(routes.publicRoutes, "controllers/");
const mappedAuthRoutes = mapRoutes(routes.privateRoutes, "controllers/", [
  authPolicy.validate,
]);
const mappedAdminRoutes = mapRoutes(routes.adminRoutes, "controllers/", [
  authPolicy.validate,
  authPolicy.checkAdminRole,
]);

// Creating a cron which runs on every sunday

// cron.schedule("0 16 * * SUN", () => {
cron.schedule("0 8 * * SUN", () => {
  console.log("running a task every sunday");
  BusinessPartnerController().changePendingStatusToReject();
});

// Creating a cron job which runs on every an hour.
cron.schedule("0 */59 * * * *", () => {
  console.log("running a task every 1 hour.");
  EventController().emailAfterEventThread();

  CouncilEventController().reminderToAddQuestionAWeekBeforeTheEvent();
  // CouncilEventController().remindToAddQuestionsAndRemindTheEventStartsTomorrow();
  // CouncilEventController().remindPanelistOneHourBeforeTheEvent();
  EventController().emailBeforeStart()
  BlogPostController().activeBlogPosts()
});

// Creating a cron job which runs on every an hour.
cron.schedule(
  "30 0 * * *",
  () => {
    console.log("running a task every day at 12:30 AM.");

    CouncilEventController().sendDailyCommentToModerator();
  },
  {
    timezone: "America/Los_Angeles",
  }
);

// Creating a cron job which runs on every day.
// TO DO: Journey process will be reimplement.
/*cron.schedule("* 0 * * *", () => {
  console.log("running a task every 1 day.");
  JourneyController().createNewItems();
});
*/

// cron job that resets the assessment and comment strike to 0
cron.schedule(
  "0 0 * * 1", // 12AM every monday
  async () => {
    console.log(
      "****************Running task at 12AM everyday****************"
    );
    console.log("****************Reset Counter****************");
    await SkillCohortParticipantController().resetCounter();
  },
  {
    timezone: "America/Los_Angeles",
  }
);

// Checks if participants have responded to a resource and kick them if they didn't
cron.schedule(
  "45 23 * * 7", //sunday 11 pm
  async () => {
    for (let i = 6; i >= 0; i--) {
      let cohortCtr = 0;

      const date = moment()
        .tz("America/Los_Angeles")
        .startOf("day")
        .utc()
        .subtract(i, "day")
        .format("YYYY-MM-DD HH:mm:ssZ");

      const allActiveSkillCohortsWithYesterdayResource =
        await SkillCohortController().getAllActiveSkillCohortsWithResource(
          date
        );

      let jaggedParticipants =
        await SkillCohortParticipantController().getAllParticipantsByListOfSkillCohort(
          allActiveSkillCohortsWithYesterdayResource
        );

      // jaggedParticipants.map((participants) => {
      //   participants.map(async (participant) => {
      //     const skillCohort =
      //       allActiveSkillCohortsWithYesterdayResource[cohortCtr];

      //     const hasResponded =
      //       await SkillCohortResourceResponseController().checkIfParticipantHasRespondedToTheResource(
      //         skillCohort,
      //         participant
      //       );

      //     if (!hasResponded) {
      //       if (participant.numberOfCommentStrike >= 2) {
      //         await SkillCohortParticipantController().removeParticipantAccess(
      //           participant,
      //           skillCohort.id
      //         );
      //       } else {
      //         await SkillCohortParticipantController().incrementCommentStrike(
      //           participant,
      //           skillCohort.id
      //         );
      //       }
      //     }
      //   });
      //   cohortCtr++;
      // });

      // const allActiveSkillCohortsWithDayBeforeYesterdayResource =
      //   await SkillCohortController().getAllActiveSkillCohortsWithResource(
      //     date
      //   );

      // cohortCtr = 0;

      // jaggedParticipants =
      //   await SkillCohortParticipantController().getAllParticipantsByListOfSkillCohort(
      //     allActiveSkillCohortsWithYesterdayResource
      //   );

      // jaggedParticipants.map((participants) => {
      //   participants.map(async (participant) => {
      //     const skillCohort =
      //       allActiveSkillCohortsWithDayBeforeYesterdayResource[cohortCtr];

      //     const hasAssessed =
      //       await SkillCohortResourceResponseAssessmentController().checkIfParticipantHasAssessedOtherComments(
      //         skillCohort,
      //         participant
      //       );

      //     if (!hasAssessed) {
      //       await SkillCohortParticipantController().incrementAssessmentStrike(
      //         participant,
      //         skillCohort.id
      //       );
      //     }
      //   });
      //   cohortCtr++;
      // });
    }
  },
  {
    timezone: "America/Los_Angeles",
  }
);

// cron job that notifies a cohort participants that a resource for the day is available through notification and email
cron.schedule(
  "0 2 * * *", // 2AM everyday
  async () => {
    console.log("running a task every 2 AM.");
    console.log("****************Notification****************");
    const skillCohortResources =
      await SkillCohortResourcesController().getResourcesToBeReleasedToday();

    const notifications = skillCohortResources.map((res) => {
      const skillCohort = res.SkillCohort || {};
      const participants = skillCohort?.SkillCohortParticipants || [];

      const participantIds = participants.map((participant) => {
        const user = participant.User;

        const mailOptions = {
          from: process.env.SEND_IN_BLUE_SMTP_SENDER,
          to: user.email,
          subject: LabEmails.DAILY_RESOURCE.subject(skillCohort, res),
          html: LabEmails.DAILY_RESOURCE.body(user, skillCohort, res),
          contentType: "text/html",
        };

        // send email
        smtpService().sendMailUsingSendInBlue(mailOptions);

        return user.id;
      });

      // notifications
      return NotificationController().createNotification({
        message: `${res.SkillCohort.title} - New resource available`,
        type: "resource",
        meta: res,
        onlyFor: participantIds,
      });
    });

    await Promise.all(notifications.flat());
  },
  {
    timezone: "America/Los_Angeles",
  }
);

cron.schedule(
  "0 3 * * 1", // 3AM Monday
  async () => {
    console.log("****************Grouping****************");
    await SkillCohortGroupingsController().createSkillCohortGroups();
  },
  {
    timezone: "America/Los_Angeles",
  }
);

cron.schedule(
  "0 4 * * *", // 4AM Everyday
  async () => {
    console.log(
      "****************Send Emails To Participants That A Cohort Will Start At Exactly 1 Week From Now****************"
    );
    let skillCohorts =
      await SkillCohortController().getAllSkillCohortThatWillStartWeekLater();

    let emailsToBeSent = [];

    skillCohorts.map((cohort) => {
      const participants = cohort.SkillCohortParticipants;

      const startDate = moment(cohort.startDate).format("LL");

      participants.map((participant) => {
        participant = participant.dataValues;

        const mailOptions = {
          from: process.env.SEND_IN_BLUE_SMTP_SENDER,
          to: participant.User.email,
          subject:
            LabEmails.SKILL_COHORT_EMAIL_ONE_WEEK_BEFORE_IT_STARTS.subject(
              cohort,
              startDate
            ),
          html: LabEmails.SKILL_COHORT_EMAIL_ONE_WEEK_BEFORE_IT_STARTS.body(
            participant.User,
            cohort
          ),
          contentType: "text/html",
        };

        const email = smtpService().sendMailUsingSendInBlue(mailOptions);

        emailsToBeSent.push(email);
      });
    });

    await Promise.all(emailsToBeSent);

    console.log(
      "****************Send Emails To Participants That A Cohort Will Start At Exactly 1 Week From Now****************"
    );
    skillCohorts =
      await SkillCohortController().getAllSkillCohortThatWillStartTomorrow();

    emailsToBeSent = [];

    skillCohorts.map((cohort) => {
      const participants = cohort.SkillCohortParticipants;

      const startDate = moment(cohort.startDate).format("LL");
      const endDate = moment(cohort.endDate).format("LL");

      let location = participants.map((participant) => {
        participant = participant.dataValues;
        const user = participant.User.dataValues;

        return user.location;
      });

      location = [...new Set(location)];

      participants.map((participant) => {
        participant = participant.dataValues;

        const mailOptions = {
          from: process.env.SEND_IN_BLUE_SMTP_SENDER,
          to: participant.User.email,
          subject: LabEmails.SKILL_COHORT_EMAIL_DAY_BEFORE_IT_STARTS.subject(
            cohort,
            startDate
          ),
          html: LabEmails.SKILL_COHORT_EMAIL_DAY_BEFORE_IT_STARTS.body(
            participant.User,
            cohort,
            startDate,
            endDate,
            participants.length,
            location.length
          ),
          contentType: "text/html",
        };

        const email = smtpService().sendMailUsingSendInBlue(mailOptions);

        emailsToBeSent.push(email);
      });
    });

    await Promise.all(emailsToBeSent);
  },
  {
    timezone: "America/Los_Angeles",
  }
);

// Job Post Auto Expiry
// cron.schedule(
//   "0 0 * * *", // 12AM every day
//   async () => {
//     console.log(
//       "****************Running task at 12AM everyday****************"
//     );
//     console.log("****************Auto Expiry****************");
//     await JobPostController().jobPostAutoExpiry();
//   },
//   {
//     timezone: "America/Los_Angeles",
//   }
// );

// Weekly Digest
cron.schedule(
  "0 0 * * *", // 12AM every day
  // "0 0 * * 5", // 12AM every Friday
  async () => {
    console.log(
      "****************Running task at 12AM everyday****************"
    );
    console.log("****************Weekly Digest****************");
    await WeeklyDigestController().updateWeeklyDigestEmail();
  },
  {
    timezone: "America/Los_Angeles",
  }
);

// User Matchmaking Count Reset
cron.schedule(
  "0 0 1 * *", // run every month
  async () => {
    const month = moment().format("M");

    // checks if the current month is an odd number and executes the reset, basically reset every 2 months
    if (+month % 2 === 1) {
      console.log(
        "****************User Matchmaking Count Reset****************"
      );
      await MatchmakingController().resetMatchedCount();
    }
  },
  {
    timezone: "America/Los_Angeles",
  }
);

// Send email to those who finish the project X
cron.schedule(
  "0 5 * * *", // 5AM Everyday
  async () => {
    console.log("****************Post Cohort****************");
    const dateToday = moment().tz("America/Los_Angeles").startOf("day");

    const cohorts =
      await SkillCohortController().getAllCohortsThatFinishedTheDayBefore(
        dateToday
      );

    cohorts.forEach((cohort) => {
      const nextMonday = moment(cohort.endDate)
        .tz("America/Los_Angeles")
        .startOf("isoWeek")
        .add(1, "week")
        .format("LL");

      cohort.SkillCohortParticipants.forEach((participant) => {
        const user = participant.User;

        const mailOptions = {
          from: process.env.SEND_IN_BLUE_SMTP_SENDER,
          to: user.email,
          subject: LabEmails.THANK_YOU_PARTICIPATION_PROJECT_X.subject(
            cohort,
            nextMonday
          ),
          html: LabEmails.THANK_YOU_PARTICIPATION_PROJECT_X.body(
            cohort,
            user,
            nextMonday
          ),
          contentType: "text/html",
        };
        smtpService().sendMailUsingSendInBlue(mailOptions);
      });
    });
  },
  {
    timezone: "America/Los_Angeles",
  }
);

cron.schedule(
  "30 0 * * *",
  () => {
    console.log("running a task everyday at 12:30.");

    AdvertisementController().changeAdvertisementStatusToEndedWhenCampaignEnds();
    AdvertisementController().sendEmailWhenCampaignStarts();
  },
  {
    timezone: "America/Los_Angeles",
  }
);

cron.schedule(
  "* 8 * * 5", // running task at 8am every friday.
  async () => {
    console.log("running a task every friday at 08:00.");
    const blogsLastWeek = await BlogPostController().getBlogPostsOfLastWeek();

    if (blogsLastWeek.length > 5) {
      let resources = [];
      const eventsLastWeek =
        await EventController().getChannelsEventsOfLastWeek();
      const podcastLastWeek =
        await PodcastController().getChannelPodcastOfLastWeek();
      const librariesLastWeek =
        await LibraryController().getChannelLibrariesOfLastWeek();

      resources = [...eventsLastWeek, ...podcastLastWeek, ...librariesLastWeek];

      await sendInBlueService().updateWeeklyBlogPostEmailTemplate(
        blogsLastWeek,
        resources
      );
    }
  }
);

// allow cross origin requests
// configure to only allow requests from certain origins
app.use(cors());

// parsing the request bodys
app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 5000000,
  })
);

// parsing file uploaded
app.use(
  fileUpload({
    limits: { fileSize: 5 * 1024 * 1024 },
  })
);

// secure your private routes with jwt authentication middleware
// app.all('/private/*', (req, res, next) => auth(req, res, next));

// fill routes for express application
app.use("/public", mappedOpenRoutes);
app.use("/private", mappedAuthRoutes);
app.use("/admin", mappedAdminRoutes);

const port = process.env.PORT || 3001;

const server = http.createServer(app);

const FEUrl = process.env.DOMAIN_URL || "http://localhost:3000/";

const usersOnline = {};

const io = socketIo(server, {
  cors: {
    origin: [
      FEUrl.slice(0, FEUrl.length - 1),
      FEUrl.slice(0, FEUrl.length - 1).replace("www.", ""),
    ],
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socketService().addSocket(socket);

  socket.on("disconnect", async () => {
    const id = usersOnline[socket.id];
    if (id) {
      const userOnline = await UserController().userIsOnline(id, false);
      io.emit(SocketEventTypes.USER_OFFLINE, userOnline.dataValues);
    }
    delete usersOnline[socket.id];
    socketService().removeSocket(socket);
  });

  socket.on("error", (error) => {
    console.log(`Socket IO Error:`, error);
  });

  socket.on(SocketEventTypes.USER_ONLINE, async ({ id }) => {
    const userOnline = await UserController().userIsOnline(id, true);
    usersOnline[socket.id] = id;
    io.emit(SocketEventTypes.USER_ONLINE, userOnline.dataValues);
  });

  socket.on(SocketEventTypes.USER_OFFLINE, async ({ id }) => {
    const userOnline = await UserController().userIsOnline(id, false);
    io.emit(SocketEventTypes.USER_OFFLINE, userOnline.dataValues);
    delete usersOnline[socket.id];
    socketService().removeSocket(socket);
  });

  socket.on(SocketEventTypes.SEND_MESSAGE, async (message) => {
    if (message.files?.length > 0) {
      for (const messageFile of message.files) {
        const newMessage = await MessageController().create({
          ...messageFile,
          ConversationId: message.ConversationId,
          sender: message.sender,
          viewedUser: message.viewedUser,
        });
        io.local.emit(SocketEventTypes.MESSAGE, newMessage);
      }
    }

    if (message.text) {
      const newMessage = await MessageController().create(message);
      newMessage.dataValues.messageDate = newMessage.dataValues.createdAt;
      io.local.emit(SocketEventTypes.MESSAGE, newMessage);
    }
  });
});

app.use(MatchController)
server.listen(port, () =>
  console.log(`url-shortener listening on port ${port}!`)
);
