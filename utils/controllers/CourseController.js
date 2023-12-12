const db = require("../models");
const HttpCodes = require("http-codes");
const isEmpty = require("lodash/isEmpty");
const Sequelize = require("sequelize");
const { Op } = require("sequelize");
const s3Service = require("../services/s3.service");
const { isValidURL } = require("../utils/profile");
const smtpService = require("../services/smtp.service");
const cryptoService = require("../services/crypto.service");
const { LabEmails } = require("../enum");

const QueryTypes = Sequelize.QueryTypes;
const Course = db.Course;
const CourseInstructor = db.CourseInstructor;
const CourseSponsor = db.CourseSponsor;

const CourseController = () => {
  /**
   * Method to get all Course objects
   * @param {*} req
   * @param {*} res
   */
  const getAll = async (req, res) => {
    const filter = req.query;
    try {
      let where = {};
      let order = [];

      if (filter.topics && !isEmpty(JSON.parse(filter.topics))) {
        where = {
          ...where,
          topics: {
            [Op.overlap]: JSON.parse(filter.topics),
          },
        };
      }

      if (filter.meta) {
        where = {
          ...where,
          title: {
            [Op.iLike]: `%${filter.meta}%`,
          },
        };
      }

      if (filter.order) {
        order = [[JSON.parse(filter.order)[0], JSON.parse(filter.order)[1]]];
      }

      let courses = await Course.findAll({
        where,
        order,
      });

      if (!courses) {
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }

      let query = `
        SELECT SUM(duration::int), "CourseId" FROM "CourseClasses" GROUP BY "CourseClasses"."CourseId"
      `;
      let classList = await db.sequelize.query(query, {
        type: QueryTypes.SELECT,
      });
      courses = courses.map((crs) => crs.toJSON());

      courses.forEach((course) => {
        const temp = classList.find((cls) => cls.CourseId === course.id);

        course.duration = temp ? temp.sum : 0;
      });
      return res.status(HttpCodes.OK).json({ courses });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  /**
   * Method to get all Course objects
   * @param {*} req
   * @param {*} res
   */
  const getAllAdmin = async (req, res) => {
    try {
      let query = `SELECT 
      c.*, 
      ARRAY(SELECT ci."InstructorId" FROM "CourseInstructors" ci where ci."CourseId" = c.id) as instructors,
      ARRAY(SELECT cs."SponsorId" FROM "CourseSponsors" cs where cs."CourseId" = c.id) as sponsors
      FROM "Courses" c`;

      let courses = await db.sequelize.query(query, {
        type: QueryTypes.SELECT,
      });

      if (!courses) {
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }

      return res.status(HttpCodes.OK).json({ courses });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };
  /**
   * Method to get Course object
   * @param {*} req
   * @param {*} res
   */
  const get = async (req, res) => {
    const { id } = req.params;
    if (id) {
      try {
        let course = await Course.findOne({
          where: {
            id,
          },
        });

        if (!course) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
        }

        let query = `SELECT 
          (CASE WHEN
          (SELECT COUNT(1) from "CourseClasses" cc WHERE cc."CourseId" = ${id}) = (select count(1) from "CourseClassUsers" ccu 
          INNER JOIN "CourseClasses" cc ON ccu."CourseClassId" = cc.id
          WHERE cc."CourseId" = ${id} AND ccu."UserId" = ${req.user.id} AND ccu.viewed = true)
          THEN true ELSE false
          END) as finished,
          (SELECT MAX(ccu."updatedAt") from "CourseClassUsers" ccu 
          INNER JOIN "CourseClasses" cc ON ccu."CourseClassId" = cc.id
          WHERE cc."CourseId" = ${id} AND ccu."UserId" = ${req.user.id} AND ccu.viewed = true) as "finishDate"
        `;

        let additionalInfoCourse = await db.sequelize.query(query, {
          type: QueryTypes.SELECT,
        });

        course.dataValues["finished"] = additionalInfoCourse[0].finished;
        course.dataValues["finishDate"] = additionalInfoCourse[0].finishDate;

        return res.status(HttpCodes.OK).json({ course });
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    } else {
      return res
        .status(HttpCodes.BAD_REQUEST)
        .json({ msg: "Bad Request: data is wrong" });
    }
  };
  /**
   * Method to add Course object
   * @param {*} req
   * @param {*} res
   */
  const add = async (req, res) => {
    const { imageData } = req.body;
    try {
      let course = await Course.create({ ...req.body });

      if (imageData) {
        let image = await s3Service().getCourseImageUrl("", imageData);
        await Course.update({ image: image }, { where: { id: course.id } });
      }

      if (req.body["instructors"]) {
        req.body["instructors"].map(async (item) => {
          await CourseInstructor.create({
            CourseId: course.id,
            InstructorId: item,
          });
        });
      }

      if (req.body["sponsors"]) {
        req.body["sponsors"].map(async (item) => {
          await CourseSponsor.create({ CourseId: course.id, SponsorId: item });
        });
      }

      return res.status(HttpCodes.OK).send();
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };
  /**
   * Method to update Course object
   * @param {*} req
   * @param {*} res
   */
  const update = async (req, res) => {
    const { id } = req.params;
    const { body } = req;

    if (id) {
      try {
        let data = {};
        let fields = [
          "title",
          "description",
          "topics",
          "instructors",
          "sponsors",
          "shrmCode",
          "hrciCode",
          "showClaim",
          "hrCreditOffered",
        ];
        for (let item of fields) {
          if (body[item]) {
            data = { ...data, [item]: body[item] };
          }
        }

        const course = await Course.findOne({
          where: {
            id,
          },
        });

        if (!course) {
          return res
            .status(HttpCodes.BAD_REQUEST)
            .json({ msg: "Bad Request: course not found." });
        }

        if (body.imageData && !isValidURL(body.imageData)) {
          data.image = await s3Service().getCourseImageUrl("", body.imageData);

          if (course.image) {
            await s3Service().deleteUserPicture(course.image);
          }
        }

        if (course.image && !body.imageData) {
          await s3Service().deleteUserPicture(course.image);
          data.image = "";
        }

        await Course.update(data, {
          where: { id },
        });

        if (data["instructors"]) {
          await CourseInstructor.destroy({
            where: { CourseId: course.id },
          });

          data["instructors"].map(async (item) => {
            await CourseInstructor.create({
              CourseId: course.id,
              InstructorId: item,
            });
          });
        }

        if (data["sponsors"]) {
          await CourseSponsor.destroy({
            where: { CourseId: course.id },
          });

          data["sponsors"].map(async (item) => {
            await CourseSponsor.create({
              CourseId: course.id,
              SponsorId: item,
            });
          });
        }

        return res.status(HttpCodes.OK).send();
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    } else {
      return res
        .status(HttpCodes.BAD_REQUEST)
        .json({ msg: "Bad Request: data is wrong" });
    }
  };
  /**
   * Method to delete Course object
   * @param {*} req
   * @param {*} res
   */
  const remove = async (req, res) => {
    let { id } = req.params;

    if (id) {
      try {
        let query = `
        DELETE FROM "CourseClassUsers" 
        WHERE 
        "CourseClassUsers"."CourseClassId" IN 
        (SELECT id FROM "CourseClasses" WHERE "CourseClasses"."CourseId" = ${id})
        `;

        await db.sequelize.query(query, {
          type: QueryTypes.DELETE,
        });

        query = `DELETE FROM "CourseClasses" where "CourseClasses"."CourseId" = ${id}`;

        await db.sequelize.query(query, {
          type: QueryTypes.DELETE,
        });

        query = `DELETE FROM "CourseInstructors" where "CourseInstructors"."CourseId" = ${id}`;

        await db.sequelize.query(query, {
          type: QueryTypes.DELETE,
        });

        query = `DELETE FROM "CourseSponsors" where "CourseSponsors"."CourseId" = ${id}`;

        await db.sequelize.query(query, {
          type: QueryTypes.DELETE,
        });

        await Course.destroy({
          where: { id },
        });

        return res.status(HttpCodes.OK).send();
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    } else {
      return res
        .status(HttpCodes.BAD_REQUEST)
        .json({ msg: "Bad Request: data is wrong" });
    }
  };

  /**
   * Method to get instructors by Course
   * @param {*} req
   * @param {*} res
   */
  const getInstructorsByCourse = async (req, res) => {
    let { course } = req.params;

    if (course) {
      try {
        let query = `
        select i.* from "Instructors" i 
        inner join "CourseInstructors" ci on i."id" = ci."InstructorId"
        where ci."CourseId" = ${course}`;
        const instructors = await db.sequelize.query(query, {
          type: QueryTypes.SELECT,
        });

        if (!instructors) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
        }

        return res.status(HttpCodes.OK).json({ instructors });
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    }
  };

  /**
   * Method to get instructors by Course
   * @param {*} req
   * @param {*} res
   */
  const getSponsorsByCourse = async (req, res) => {
    let { course } = req.params;

    if (course) {
      try {
        let query = `
        select s.* from "Sponsors" s
        inner join "CourseSponsors" cs on s."id" = cs."SponsorId"
        where cs."CourseId" = ${course}`;
        const sponsors = await db.sequelize.query(query, {
          type: QueryTypes.SELECT,
        });

        if (!sponsors) {
          return res
            .status(HttpCodes.INTERNAL_SERVER_ERROR)
            .json({ msg: "Internal server error" });
        }

        return res.status(HttpCodes.OK).json({ sponsors });
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    }
  };

  const claim = async (req, res) => {
    const { id, pdf } = req.body;
    const { user } = req;

    if (id) {
      try {
        let course = await Course.findOne({
          where: {
            id,
          },
        });

        course = course.toJSON();
        course = {
          ...course,
          shrmCode: cryptoService().decrypt(course.shrmCode),
          hrciCode: cryptoService().decrypt(course.hrciCode),
        };

        let mailOptions = {
          from: process.env.SEND_IN_BLUE_SMTP_SENDER,
          to: user.email,
          subject: LabEmails.COURSE_CLAIM.subject(course.title),
          html: LabEmails.COURSE_CLAIM.body(user, course),
          attachments: [
            {
              filename: "certificate.pdf",
              contentType: "application/pdf",
              content: Buffer.from(pdf.substr(pdf.indexOf(",") + 1), "base64"),
            },
          ],
        };

        await smtpService().sendMailUsingSendInBlue(mailOptions);

        return res.status(HttpCodes.OK).json({});
      } catch (error) {
        console.log(error);
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }
    }
    return res
      .status(HttpCodes.BAD_REQUEST)
      .json({ msg: "Bad Request: Podcast Series id is wrong" });
  };

  return {
    getAll,
    getAllAdmin,
    get,
    add,
    update,
    remove,
    getInstructorsByCourse,
    getSponsorsByCourse,
    claim,
  };
};

module.exports = CourseController;
