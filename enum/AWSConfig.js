module.exports = {
  AWS: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  S3: {
    IMAGE_BUCKET_NAME: "lab-user-images",
    IMAGE_BUCKET_URL: "https://lab-user-images.s3.us-east-2.amazonaws.com",
    PROFILE_IMAGE_FOLDER: "profile",
    EVENT_IMAGE_FOLDER: "event",
    LIBRARY_IMAGE_FOLDER: "library",
    PODCAST_IMAGE_FOLDER: "podcast",
    MARKETPLACE_IMAGE_FOLDER: "marketplace",
    PARTNER_IMAGE_FOLDER: "partner",
    CHANNEL_IMAGE_FOLDER: "channel",
    COURSE_IMAGE_FOLDER: "course",
    FILE_IMAGE_FOLDER: 'filePost',
    SPONSOR_IMAGE_FOLDER: "sponsor",
    INSTRUCTOR_IMAGE_FOLDER: "instructor",
    POST_IMAGE_FOLDER: "post",
    SKILL_COHORT_IMAGE_FOLDER: "skill-cohort",
    BLOG_POST_IMAGE_FOLDER: "blogPost",
    SIMULATION_SPRINT_IMAGE_FOLDER: "simulationSprints",
    EVENT_EMAIL_FOLDER: 'event-email',
    //FILES
    UPLOAD_FILES_LAB: "upload-files-lab",
    // Resume
    RESUME_BUCKET_NAME: "user-resume-bucket",
    // Editor
    EDITOR_BUCKET_NAME: "lab-user-images",
    JOB_POST_IMAGE_FOLDER: "job-post-image-folder",
    ADVERTISEMENT_FOLDER: "advertisement",
    COUNCIL_CONVERSATION_FOLDER: "council-conversation-folder",
  },
};
