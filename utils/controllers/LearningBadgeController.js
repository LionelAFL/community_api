const db = require("../models");
const HttpCodes = require("http-codes");
const Sequelize = require("sequelize");

const QueryTypes = Sequelize.QueryTypes;

const LearningBadgeController = () => {
  /**
   * Method to get all Post objects
   * @param {*} req
   * @param {*} res
   */
  const getAll = async (req, res) => {
    const filter = req.query;
    try {
      let limit = ``;
      if (filter.page) {
        limit = `LIMIT ${filter.num} OFFSET ${(filter.page - 1) * filter.num}`;
      }
      let query = `
      select
            u.email,
            u."firstName",
            u."lastName",
            u."titleProfessions",
            u."img",
            SUM(main_data.duration) / 60 as hours
        from
            (
            select
                'podcastseries' as element,
                cast(coalesce(ps."durationLearningBadges", '0') as float) as duration,
                ps.id,
                psd.key,
                psd.value
            from
                "PodcastSeries" ps
            join jsonb_each_text(ps.viewed) psd on
                true
        union
            select
                'conference_library' as element,
                cast(coalesce(cl.duration, '0') as float) as duration,
                cl.id,
                cld.key,
                cld.value
            from
                "ConferenceLibraries" cl
            join jsonb_each_text(cl.viewed) cld on
                true
        union
            select
                'library' as element,
                cast(coalesce(l.duration, '0') as float) as duration,
                l.id,
                ld.key,
                ld.value
            from
                "Libraries" l
            join jsonb_each_text(l.viewed) ld on
                true
        union
            select
                'podcast' as element,
                cast(coalesce(p.duration, '0') as float) as duration,
                p.id,
                pd.key,
                pd.value
            from
                "Podcasts" p
            join jsonb_each_text(p.viewed) pd on
                true
        ) main_data
        inner join "Users" u on
            main_data.key = cast(u.id as varchar)
        where
            main_data.value = 'mark'
        group by
            u.email,
            u."firstName",
            u."lastName",
            u."titleProfessions",
            u."img"
        order by
            hours desc
        
        ${limit}
      `;

      const learningBadges = await db.sequelize.query(query, {
        replacements: {
          page: filter.page,
          size: filter.num,
        },
        type: QueryTypes.SELECT,
      });

      if (!learningBadges) {
        return res
          .status(HttpCodes.INTERNAL_SERVER_ERROR)
          .json({ msg: "Internal server error" });
      }

      return res.status(HttpCodes.OK).json({ learningBadges });
    } catch (error) {
      console.log(error);
      return res
        .status(HttpCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Internal server error" });
    }
  };

  return {
    getAll,
  };
};

module.exports = LearningBadgeController;
