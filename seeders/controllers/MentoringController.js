const db = require("../models");
const HttpCodes = require("http-codes");
const Sequelize = require("sequelize");
const smtpService = require("../services/smtp.service");

const Mentoring = db.Mentoring;
const User = db.User;
const QueryTypes = Sequelize.QueryTypes;

const MentoringController = () => {
  const create = async (req, res) => {
    const { body } = req;
    const { id } = req.token;

    if (body.title) {
      let mentorInfo = {
        ...body,
      };
      // create a record on Mentoring table
      const mentor = await Mentoring.create({ ...mentorInfo, user: id });
      // add reference to User table
      const [numberOfAffectedRows, affectedRows] = await User.update(
        {
          [mentorInfo.isMentor ? "mentor" : "mentee"]: mentor.id,
        },
        {
          where: { id },
          returning: true,
          plain: true,
        }
      );

      return res
        .status(HttpCodes.OK)
        .json({ user: affectedRows, mentorInfo: mentor });
    } else {
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error", error: error });
    }
  };

  const getMentoringInfo = async (req, res) => {
    const { id } = req.token;

    try {
      const mentoringInfo = await Mentoring.findAll({
        where: {
          user: id,
        },
      });

      if (!mentoringInfo) {
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Bad Request: Event not found" });
      }

      return res.status(HttpCodes.OK).json({ mentoringInfo });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const updateMentoringInfo = async (req, res) => {
    const { body } = req;

    if (body.id && body.title) {
      let mentorInfo = {
        title: body.title,
        areas: body.areas,
        about: body.about,
      };
      if (body.blockMatchAsMentor !== undefined) {
        mentorInfo.blockMatchAsMentor = body.blockMatchAsMentor ? 1 : 0
      }
      if (body.blockMatchAsMentee !== undefined) {
        mentorInfo.blockMatchAsMentee = body.blockMatchAsMentee ? 1 : 0
      }
      // create a record on Mentoring table
      const [numberOfAffectedRows, affectedRows] = await Mentoring.update(
        {
          ...mentorInfo,
        },
        {
          where: { id: body.id },
          returning: true,
          plaing: true,
        }
      );
      // add reference to User table
      return res.status(HttpCodes.OK).json({ mentorInfo: affectedRows });
    } else {
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error", error: error });
    }
  };

  const getMentorList = async (req, res) => {
    const filter = req.query;
    const { id } = req.token;

    try {
      const user = await User.findByPk(id);
      if (user.mentee) {
        const menteeInfo = await Mentoring.findByPk(user.mentee);

        if (!menteeInfo) {
          return res
            .status(HttpCodes.BAD_REQUEST)
            .json({ msg: "Mentee Info not found." });
        }

        let query = `
        SELECT COUNT(*) OVER() AS total, public."Users".*, public."Mentorings"."id" as mid, public."Mentorings"."title" as title, public."Mentorings"."about" as "mentorAbout", public."Mentorings"."areas" as areas, public."Mentorings"."isMentor" as "isMentor", public."Mentorings"."blockMatchAsMentor" as "blockMatchAsMentor", public."Mentorings"."connectedMembers" as "connectedMembers"
          FROM public."Mentorings" 
          JOIN public."Users" ON public."Mentorings".user = public."Users".id 
          WHERE public."Mentorings"."isMentor" = 1 
          AND (public."Mentorings".areas)::text[] && ('{${menteeInfo.areas.join(
            ","
          )}}')::text[] 
          AND public."Mentorings"."user" <> ${id}
          LIMIT ${filter.num} OFFSET ${(filter.page - 1) * filter.num}
        `;

        const mentorList = await db.sequelize.query(query, {
          type: QueryTypes.SELECT,
        });

        return res.status(HttpCodes.OK).json({ mentorList });
      }

      return res
        .status(HttpCodes.BAD_REQUEST)
        .json({ msg: "You are not allowed." });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const getMenteeList = async (req, res) => {
    const filter = req.query;
    const { id } = req.token;

    try {
      const user = await User.findByPk(id);
      if (user.mentor) {
        const mentorInfo = await Mentoring.findByPk(user.mentor);

        if (!mentorInfo) {
          return res
            .status(HttpCodes.BAD_REQUEST)
            .json({ msg: "Mentor Info not found." });
        }

        let query = `
        SELECT COUNT(*) OVER() AS total, public."Users".*, public."Mentorings"."id" as mid, public."Mentorings"."title" as title, public."Mentorings"."about" as "mentorAbout", public."Mentorings"."areas" as areas, public."Mentorings"."isMentor" as "isMentor", public."Mentorings"."blockMatchAsMentee" as "blockMatchAsMentee", public."Mentorings"."connectedMembers" as "connectedMembers"
          FROM public."Mentorings" 
          JOIN public."Users" ON public."Mentorings".user = public."Users".id 
          WHERE public."Mentorings"."isMentor" = 0 
          AND (public."Mentorings".areas)::text[] && ('{${mentorInfo.areas.join(
            ","
          )}}')::text[]
          AND public."Mentorings"."user" <> ${id}
          LIMIT ${filter.num} OFFSET ${(filter.page - 1) * filter.num}
        `;

        const menteeList = await db.sequelize.query(query, {
          type: QueryTypes.SELECT,
        });

        return res.status(HttpCodes.OK).json({ menteeList });
      }

      return res
        .status(HttpCodes.BAD_REQUEST)
        .json({ msg: "You are not allowed." });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  const setMatch = async (req, res) => {
    const { source, target, match } = req.query;

    try {
      await Mentoring.update(
        {
          connectedMembers: Sequelize.fn(
            match ? "array_append" : "array_remove",
            Sequelize.col("connectedMembers"),
            source
          ),
        },
        {
          where: { id: target },
          returning: true,
          plain: true,
        }
      );

      const [numberOfAffectedRows, affectedRows] = await Mentoring.update(
        {
          connectedMembers: Sequelize.fn(
            match ? "array_append" : "array_remove",
            Sequelize.col("connectedMembers"),
            target
          ),
        },
        {
          where: { id: source },
          returning: true,
          plain: true,
        }
      );

      const { isMentor } = affectedRows;

      const [srcMember, targetMember] = await Promise.all(
        isMentor
          ? [
              User.findOne({ where: { mentor: source } }),
              User.findOne({ where: { mentee: target } }),
            ]
          : [
              User.findOne({ where: { mentee: source } }),
              User.findOne({ where: { mentor: target } }),
            ]
      );

      await smtpService().sendMatchEvent(srcMember, targetMember, isMentor);

      return res
        .status(HttpCodes.OK)
        .json({ numberOfAffectedRows, affectedRows });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  return {
    create,
    getMentoringInfo,
    updateMentoringInfo,
    getMentorList,
    getMenteeList,
    setMatch,
  };
};

module.exports = MentoringController;
