module.exports = {
  NEW_USER_SIGNUP: {
    subject: () => `WOW! You are in the Hacking HR LAB! THANK YOU!`,
    body: (user) => `
      <p>
      Hi, ${user.firstName}
      </p>
      <p>
      Thank you so much for joining the Hacking HR LAB!
      </p>
      <p>
      Check out all the tools we have available here: <a href="https://www.hackinghrlab.io/join">https://www.hackinghrlab.io/join</a>
      </p>
      <p>
      I have to say: how cool and awesome is to have you in this platform. We built it for you… and you made it! THANK YOU.
      </p>
      <p>
      We have a bunch of great features and content for you. And we are working nonstop in product development and improvement. That means that you will be seeing changes and a lot of more value every time you log in.
      </p>
      <p>
      If you think this is a good place for you to invest some money, please become a PREMIUM member for $159 a year. Just click on UPGRADE. You will get access to EVERYTHING. And when I say EVERYTHING, I mean everything that we have now and everything we will develop and deploy in the future.
      </p>
      <p>
      Well. Long email… 
      </p>
      <p>
      For now, THANK YOU for being here and do not hesitate to let me know about feedback, comments, ideas, questions, stories or anything else. I am here: <a href="mailto:enrique@hackinghr.io">enrique@hackinghr.io</a>
      </p>
      <p>
      THANK YOU!
      </p>
      <p>
      <br />
      Enrique Rubio
      <br />
      Founder
      <br />
      Hacking HR
      <br />
    `,
  },
  USER_BECOME_PREMIUM: {
    subject: () => `Wowza! You are now a PREMIUM MEMBER of the Hacking HR LAB!`,
    body: (user) => `
      <p>
      Hi, ${user.firstName}
      </p>
      <p>
      It is… let me think… ok… WONDERFUL, AMAZING, AWESOME and GREAT that you became a PREMIUM member of the Hacking HR LAB!
      </p>
      <p>
      Thank you so much!
      </p>
      <p>
      You will now have access to all the PREMIUM tools we have available (including the new ones coming up!). Please make sure you use everything… thoroughly! There’s a lot of content and features for you.
      </p>
      <p>
      And PLEASE, like really PLEASE, if there is something that isn’t working properly (techy bugs… they happen!), something we can improve, or a tool that you’d love to see and we don’t have, just shoot me an email and let me know about it. I can’t promise that we will move faster than the speed of light (whoops that’s impossible!), but we are pretty fast to fix bugs, improve existing features and create new ones.
      </p>
      <p>
      I am here: <a href="mailto:enrique@hackinghr.io">enrique@hackinghr.io</a> and, as always, right at you service and honor to serve you!
      </p>
      <p>
      THANK YOU!
      </p>
      <br />
      Enrique Rubio
      <br />
      Founder
      <br />
      Hacking HR
      <br />
    `,
  },
  EVENT_REMINDER_24_HOURS: {
    subject: (event) => `${event.title} is coming up in one day!`,
    body: (user, event, startDate, startTime) => `
      <p>
      Hi, ${user.firstName}
      </p>
      <p>
      We are so excited you are joining us at ${event.title} organized by ${event.organizer}.
      </p>
      <p>
      We look forward to seeing you on ${startDate} at ${startTime}.
      </p>
      <p>
      This is the link to connect: <a target="_blank" href="${event.link}">${event.link}</a>
      </p>
      <p>
      Please remember to go back to the Hacking HR LAB the day after the event and certify that you attended. If you are a PREMIUM MEMBER you will be able to claim your digital certificate of participation and (if applicable) HR recertification credits.
      </p>
      <br />
      Thank you!
      <br />
      Hacking HR Team
      <br/>
    `,
  },
  EVENT_REMINDER_45_MINUTES: {
    subject: (event) => `Almost here! Coming up in two hours: ${event.title}`,
    body: (user, event) => `
      <p>
      Hi, ${user.firstName}
      </p>
      <p>
      The time has come!
      </p>
      <p>
      See you in two hours at ${event.title} organized by ${event.organizer}.
      </p>
      <p>
      Connect this link: <a target="_blank" href="${event.link}">${event.link}</a>
      </p>
      <p>
      Please remember to go back to the Hacking HR LAB the day after the event and certify that you attended. If you are a PREMIUM MEMBER you will be able to claim your digital certificate of participation and (if applicable) HR recertification credits.
      </p>
      <br />
      Thank you!
      <br />
      Hacking HR Team
      <br/>
    `,
  },
  PARTICIPANTS_LIST_TO_ORGANIZER: {
    subject: () => `PARTICIPANTS LIST`,
    body: (event, users) => `
      <h3>${event.title}</h3>
      <p>
      ${users
        .map((user) => {
          return `
          ${user.firstName} ${user.lastName},     ${user.email}
          <br />
      `;
        })
        .join("")}
      </p>
    `,
  },
  PODCAST_SERIES_CLAIM: {
    subject: (title) =>
      ` Thank you for participating in the podcast series "${title}"`,
    body: (user, podcastSeries) => `
      <p>
        Hi, ${user.firstName}
      </p>
        Thank you so much for tuning in to Hacking HR's Podcast Series "${podcastSeries.title}".
      <p>
        Did you enjoy the content and the conversation? We hope so! Please share with your network!
      </p>
      <p>
        Please see attached Hacking HR's certificate of attendance.
      </p>
      <p>
        This podcast series awards:
      </p>
      <p>
        ${podcastSeries.hrCreditOffered}
      </p>
      <p>
        The Codes are:
        <br>
        <strong>SHRM: </strong>${podcastSeries.shrmCode}
        <br>
        <strong>HRCI: </strong>${podcastSeries.hrciCode}
      </p>
      <p>
        Thank you so much! We hope you tune in to more podcast series.
      </p>
      <p>
        Hacking HR Team
      </p>
    `,
  },
  LIBRARY_CLAIM: {
    subject: (title) =>
      ` Thank you for participating in the library "${title}"`,
    body: (user, library,type) => `
      <p>
        Hi, ${user.firstName}
      </p>
        Thank you so much for tuning into Hacking HR's Library content: "${(type === '2023') ? library.panelName : library.title}".
      <p>
        We hope you enjoy the content. PLEASE share with your network!
      </p>
      <p>
        The HR recertification codes are:
      </p>
      <p>
        <strong>SHRM: </strong>${library.shrmCode}
        <br>
        <strong>HRCI: </strong>${library.hrciCode} ${(library.hrciCreditType !== '' && library.hrciCreditType !== undefined && library.hrciCreditType !== null) ? ` | Credit Type: ${library.hrciCreditType}` : ''}
      </p>
      <p>
        Thank you so much! We hope you continue enjoying the content!
      </p>
      <p>
        Hacking HR Team
      </p>
    `,
  },
  EVENT_CLAIM_CREDIT: {
    subject: (title) =>
      `Hacking HR's Event: "${title}" (HR recertification credits included)`,
    body: (user, event) => `
      <p>
        Hi, ${user.firstName}
      </p>
        Thank you so much for joining the ${event.organizer}'s event: "${
      event.title
    }".
      <p>
        We hope you enjoyed the event!
      </p>
      <p>
        Please see attached Hacking HR's certificate of attendance.
      </p>
      ${
        event.showClaim === 1
          ? `
            <p>
              The SHRM/HRCI codes for this event are:
              <br>
              <strong>SHRM: </strong>${event.shrmCode}
              <br>
              <strong>HRCI: </strong>${event.hrciCode}
            </p>
      `
          : ""
      }
      <p>
        Thank you so much!
      </p>
      <p>
        Hacking HR Team
      </p>
    `,
  },
  EVENT_CLAIM_ATTENDANCE: {
    subject: (title) => `Hacking HR's Event: ${title}`,
    body: (user, event) => `
      <p>
        Hi, ${user.firstName}
      </p>
        Thank you so much for joining us at ${event.title} organized by ${event.organizer}.
      <p>
      <p>
        The HR attendance code is: ${event.code}
      </p>
      <p>
        Thank you so much!
      </p>
      <p>
        Hacking HR Team
      </p>
    `,
  },
  COURSE_CLAIM: {
    subject: (title) => ` Thank you for participating in the course "${title}"`,
    body: (user, course) => `
      <p>
        Hi, ${user.firstName}
      </p>
        Thank you so much for tuning in to Hacking HR's Course "${course.title}".
      <p>
        Did you enjoy the content and the conversation? We hope so! Please share with your network!
      </p>
      <p>
        Please see attached Hacking HR's certificate of attendance.
      </p>
      <p>
        The Codes are:
        <br>
        <strong>SHRM: </strong>${course.shrmCode}
        <br>
        <strong>HRCI: </strong>${course.hrciCode}
      </p>
      <p>
        Thank you so much! We hope you tune in to more courses.
      </p>
      <p>
        Hacking HR Team
      </p>
    `,
  },
  BONFIRE_INVITATION: {
    subject: (firstName) =>
      `${firstName}: You have been invited to a Bonfire, a Hacking HR networking experience created by members of the community!`,
    body: (
      firstName,
      bonfire,
      bonfireCreator,
      startDate,
      startTime,
      link,
      timezone
    ) => `
      <p>Hi ${firstName},</p>
      <p>Bonfires are networking opportunities created by and for members of the Hacking HR community.</p>
      <p>We created this tool to promote collaboration, learning and networking! All our Hacking HR LAB Premium members can create Bonfires, and all members (premium and free) can participate.</p>
      <p>Bonfires are excellent spaces for interesting discussions to help advance the HR profession and help you solve the most complex business challenges you may be dealing with!</p>
      <p>You have been invited to join this upcoming bonfire:</p>
      <h3>${bonfire.title}</h3>
      <p>Date: ${startDate} at ${startTime} (${timezone}) created by ${
      bonfireCreator.firstName
    } ${bonfireCreator.lastName} (${bonfireCreator.email})</p>
      <p>This bonfire is about “${
        bonfire.description
      }” and the main topics of the discussion are ${bonfire.categories.join(
      ", "
    )} and you were invited because you have interests that align with the topic of this conversation! </p>
    <p>We hope you can join. If you are joining, please click here to <a href="${
      process.env.DOMAIN_URL
    }bonfires?key=my-bonfires" tagert="_blanck">CONFIRM ATTENDANCE</a> and download the calendar reminders!</p>
    <p>This is the link to connect: <a href="${link}bonfires?key=my-bonfires" target="_blank">LINK</a></p>
    <p>Attached a calendar invite including all details, just in case!</p>
    <p>Happy networking!</p>
    <p>Hacking HR LAB</p>

    <p>P.S.: Bonfires <strong>ARE NOT</strong> tools for sales or marketing pitches. If this happens during your bonfire and the bonfire organizer is selling or marketing a product or service, 
    or using you for any purpose other than networking, collaboration and learning, please report it to us (enrique@hackinghr.io). We will take immediate action.</p>
    `,
  },
  BONFIRE_CREATOR: {
    subject: (firstName) =>
      `${firstName}! Thank you for creating a Bonfire in the Hacking HR LAB!`,
    body: (firstName, bonfire, startDate, startTime, timezone) => `
    <p>
    Hi, ${firstName},
    </p>
    <p>
    Thank you so much for creating the bonfire: "${bonfire.title}" on ${startDate} at ${startTime} (${timezone})
    </p>
    <p>
    <b>Quick note before moving on: time zones are always a headache for everyone. PLEASE make sure that you entered the proper time zone when creating your Bonfire. Thank you!.</b>
    </p>
    <p>
    We created the Bonfire tool as a cool and valuable way for networking, collaboration and learning among HR professionals. We are thankful with you for creating this space for meaningful conversations and networking.
    </p>
    <p>
    Hacking HR LAB members invited to the Bonfire have to confirm their attendance. In the Bonfires that you create you can download a list of those who have confirmed their attendance. Go back to the Hacking HR LAB, click on Bonfires, search for the Bonfire you created and click on Download Confirmed Participants. PLEASE: DO NOT, under ANY circumstance, add their emails to any emailing list without their explicit consent. Doing so will ban you from creating future Bonfires. THANK YOU!
    </p>
    <p>
    Also, we added the bonfire in the “Bonfire” list in the Hacking HR LAB so that anyone can find it and join! 
    </p>
    <p>
    One last thing: as the creator of the Bonfire you have a wonderful opportunity to shape the conversation to be meaningful and valuable for those who join you. We count on you to facilitate a wonderful space that is safe, respectful and tolerant. Partisan political conversations or sales pitches are not allowed and should you engage in such conversations you will be banned from creating future bonfires.
    </p>
    <p>Thank you so much!!!</p>
    <p>
    Happy networking! 
    </p>
    <br>
    <p>Enrique Rubio</p>
    <p>Founder</p>
    <p>Hacking HR</p>
    <br>
    `,
  },
  BONFIRE_JOINING: {
    subject: (firstName) =>
      `${firstName}! Thank you for joining a Bonfire, a Hacking HR networking experience created by members of the community!`,
    body: (
      firstName,
      bonfire,
      bonfireCreator,
      startDate,
      startTime,
      link,
      timezone
    ) => `
    <p>
    Hi ${firstName},
    </p>
    <p>
    Bonfires are networking opportunities created by and for members of the Hacking HR community.
    </p>
    <p>
    We created this tool to promote collaboration, learning and networking! All our Hacking HR LAB Premium members can create Bonfires, and all members (premium and free) can participate.
    </p>
    <p>
    Bonfires are excellent spaces for interesting discussions to help advance the HR profession and help you solve the most complex business challenges you may be dealing with! 
    </p>
    <p>
    Thank you for joining the upcoming bonfire: 
    </p>
    <h3>${bonfire.title}</h3>
    <p>Date: ${startDate} at ${startTime} (${timezone}) created by ${
      bonfireCreator.firstName
    } ${bonfireCreator.lastName} (${bonfireCreator.email})!</p>
    <p>This bonfire is about "${
      bonfire.description
    }" and the main topics of the discussion are ${bonfire.categories.join(
      ", "
    )}.</p>
    <p>This is the link to connect: <a href="${link}" target="_blank">Link</a>
    </p>
    <p>Attached a calendar invite including all details, just in case!</p>
    <p>Happy networking!</p>
    <p>Hacking HR LAB</p>

    <p>P.S.: Bonfires <strong>ARE NOT</strong> tools for sales or marketing pitches. If this happens during your bonfire and the bonfire organizer is selling or marketing a product or service, 
    or using you for any purpose other than networking, collaboration and learning, please report it to us (enrique@hackinghr.io). We will take immediate action.</p>
    `,
  },
  BONFIRE_DELETED: {
    subject: (firstName, bonfireTitle) =>
      `${firstName}: "${bonfireTitle}" was deleted`,
    body: (firstName, bonfire, startDate, startTime, timezone) => `
    <p>
    Hi ${firstName}
    </p>
    <p>
    We are sorry to let you know that the bonfire: “${bonfire.title}” which was 
    scheduled for ${startDate} and ${startTime} (${timezone}) has been deleted by its creator. 
    </P>
    <p>
    Please visit the <a href="https://www.hackinghrlab.io/">Hacking HR LAB</a> to check and join other bonfires. 
    </p>
    <p>
    Thank you! 
    </p>
    <p>
    Hacking HR LAB
    </p>
    `,
  },
  BONFIRE_EDITED: {
    subject: (firstName, bonfireTitle) =>
      `${firstName}: The Bonfire "${bonfireTitle}" was edited. Please download the new calendar reminder`,
    body: (
      firstName,
      oldBonfireTitle,
      newBonfireinfo,
      startDate,
      startTime,
      timezone
    ) => `
    <p>
    Hi ${firstName}
    </p>
    <p>
    The bonfire: “${oldBonfireTitle}” has been edited.
    </P>
    <p>
    These are the new details: 
    </p>
    <p>${newBonfireinfo.title}</p>
    <p>${startDate}</p>
    <p>${startTime} (${timezone})</p>
    <p>${newBonfireinfo.link}</p>
    <p>
    Please go to the Hacking HR LAB -> Bonfires and search for this Bonfire in the tab “My Bonfires” to download the new calendar reminder. 
    </p>
    <p>Thank you and happy networking!</p>
    <p>
    Hacking HR LAB
    </p>
    `,
  },
  BONFIRE_REMINDER_1_DAY_BEFORE: {
    subject: (firstName, startTime, timezone) =>
      `${firstName}: please open this email to check the list of confirmed attendees for your Bonfire that starts tomorrow at ${startTime} (${timezone})!`,
    body: (firstName) => `
  <p>
  Hi ${firstName},
  </p>
  <p>
  You can download a list of those who have confirmed their attendance to your Bonfire. 
  </P>
  <p>
  Go back to the Hacking HR LAB, click on Bonfires, search for the Bonfire you created and click on Download Confirmed Participants. 
  </p>
  <p>Thank you and happy networking!</p>
  <p>Hacking HR LAB</p>
  <p>
  P.S.: DO NOT, under ANY circumstance, add their emails to any emailing list without their explicit consent. Doing so will ban you from creating future Bonfires. THANK YOU!
  </p>
  `,
  },
  BONFIRE_REMINDER_1_HOUR_BEFORE: {
    subject: (firstName) =>
      `${firstName}: please open this email to check the list of confirmed attendees for your Bonfire that starts in one hour!`,
    body: (firstName) => `
    <p>
    Hi ${firstName},
    </p>
    <p>
    You can download a list of those who have confirmed their attendance to your Bonfire that starts in one hour. 
    </P>
    <p>
    Go back to the Hacking HR LAB, click on Bonfires, search for the Bonfire you created and click on Download Confirmed Participants. 
    </p>
    <p>Thank you and happy networking!</p>
    <p>Hacking HR LAB</p>
    <p>
    P.S.: DO NOT, under ANY circumstance, add their emails to any emailing list without their explicit consent. Doing so will ban you from creating future Bonfires. THANK YOU!
    </p>
    `,
  },
  BONFIRE_USERS_JOINED_1_HOUR_REMINDER: {
    subject: (firstName, bonfireTile) =>
      `${firstName}: The Bonfire ("${bonfireTile}") is startin in one hour!`,
    body: (firstName, bonfireTile, link, bonfireCreator) => `
    <p>
    Hi ${firstName}
    </p>
    <p>
    We are excited that you are joining ${bonfireTile} which is starting in one hour!
    </P>

    <p>This is the link to connect: <a href="${link}" target="_blank">LINK</a></p>
    
    <p>If you have any question, please contact the Bonfire creator directly: ${bonfireCreator.firstName} ${bonfireCreator.lastName} (${bonfireCreator.email})!</p>
    <p>Happy networking!</p>
    <p>Hacking HR LAB</p>
    <p>
    P.S.: Bonfires <strong>ARE NOT</strong> tools for sales or marketing pitches. If this happens during your bonfire and the bonfire organizer is selling or 
    marketing a product or service, or using you for any purpose other than networking, collaboration and learning, please report it to us (enrique@hackinghr.io). 
    We will take immediate action.
    </p>
    `,
  },
  JOIN_COHORT_EMAIL: {
    subject: (cohort, startDate) => `
    Welcome to Hacking HR's ProjectX Cohort: ${cohort.title} (Starting on ${startDate})
    `,
    body: (user, cohort, startDate) => `
    <p>
      Hi ${user.firstName},
    </p>
    <p>
      Welcome to Hacking HR's ProjectX!
    </p>  
    <p>
      We are so excited to have you join the cohort "${cohort.title}" starting on "${startDate}"!
    </p>
    <p>
    Our goal with ProjectX is to help you learn or improve your knowledge in the specific
    skill covered in ${cohort.title} through daily resources and personal 
    reflections.  
    </p>
    <p>
    This program is intense, but light touch: we will provide a daily resource that you 
    should be able to read, listen or watch in less than 20 minutes. Daily means daily: 
    66 consecutive days.
    </p>
    <p>
    Besides reading, listening or watching the daily resource, you will provide a 
    personal reflection about what you learned and how you plan to apply the lessons 
    learned.
    </p>
    <p>
    This cohort program lasts 66 consecutive days. Each day, for 66 consecutive days, 
    you will receive a daily resource and you must provide a reflection about the 
    resource. The reflection should address the question: “what did I learn from this 
    resource and how can I apply it in my day to day practice/work?”
    </p>
    <p>
    Reading, listening or watching the resource and providing the reflection shouldn’t 
    take more than 20-25 minutes per day... Hey, “excellence is a habit”... and we aim 
    to make light-touch learning a habit with discipline and commitment. 
    </p>
    <p>
    The program relies on daily consistency and discipline. Instead of bugging you with 
    heavy daily resources, “self-pace” learning program for which you disengage too 
    soon or long programs that lasts for hours and months, we only ask you for 20-25 
    minutes or less on a daily basis for 66 days. That’s it!
    </p>
    <p>
    Enjoy the program. Happy learning. And please do not hesitate to reach out if you 
    have any questions: <a href="mailto:enrique@hackinghr.io">enrique@hackinghr.io</a>
    </p>
    <p>
      Thank you! 
    </p>
    <p>
      Enrique Rubio <br>
      Founder <br>
      Hacking HR <br>
    </p>
    `,
  },
  DAILY_RESOURCE: {
    subject: (cohort, resource) => `
    Today’s Resource is: "${resource.title}"
    `,
    body: (user, cohort, resource) => `
    <p>
      Hi ${user.firstName},
    </p>
    <p>
      Today’s resource as part of the Cohort ${cohort.title} is: <br> <br>
      - ${resource.title} <br>
      - Type: ${resource.type} <br>
      - Link: ${resource.resourceLink} <br>
      - Estimated duration: ${resource.duration} minutes <br>
    </p>
    <p>
    Please remember to provide your reflection about this resource. The reflection 
    should address the question: “what did I learn from this resource and how can I 
    apply it in my day to day practice/work?”
    </p>
    <p>
    To enter your reflection, please go to the Hacking HR LAB, click on ProjectX -> My 
    Cohorts -> look for this cohort, and click on JOIN THE CONVERSATION on the 
    corresponding resource.
    </p>
    <p>
    Don’t forget that you will be removed from the program if you miss to provide your 
    response two times during a given week. This means that you must provide on at 
    least five resources during one week. If you fail this requirement you will be 
    removed from the program and will not have access anymore to the dashboard. We 
    assess the completion of this requirement on Sunday evening (Pacific Time Zone). 
    Before then you should have completed five reflections or more to continue with the
    program the following week. The assessment of the completion of the weekly 
    requirement is an automated process and there is no way to include you again after
    you are removed from the cohort for missing two or more activities.
    </p>

    <p>
    Please note: whether you receive the daily email or not, the resource will be posted 
    in the Cohort dashboard in the Hacking HR LAB. Sometimes our emails get stuck 
    somewhere in the strange world of the Internet. If that’s the case, please GO to the 
    Cohort dashboard and review the resource. You still have to complete the daily 
    activity, even if you don’t receive the daily resource email on a given day.
    </p>
    <p>
    Finally, if you have any trouble accessing the cohort on your mobile device, please 
    try from your computer.
    </p>
    <p>
      Thank you! 
    </p>
    <p>
      Hacking HR LAB
    </p>
    `,
  },
  KICK_OUT: {
    subject: (cohort) => `
    You have missed two mandatory activities ${cohort.title} - you can’t join this cohort 
    anymore
    `,
    body: (user, cohort) => `
    <p>
      Hi ${user.firstName}
    </p>
    <p>
    Unfortunately you have missed two mandatory activities this week. We understand 
    that life and work happen and perhaps other priorities came up and you had to 
    reallocate your time. It’s ok. 
    </p>
    <p>
    We hope you can join a future cohort on the same skill or any other similar skill. 
    </p>
    <p>
    You won’t be able to join this cohort’s dashboard anymore and you will not receive 
    any more information about it. 
    </p>
    <p>
      Thank you for your understanding. 
    </p>
    <p>
      Hacking HR LAB
    </p>
    `,
  },
  WITHDRAW_PARTICIPATION: {
    subject: (cohort) =>
      `You have withdrawn from Hacking HR's ProjectX: ${cohort.title}`,
    body: (user) => `
    <p>
      Hi ${user.firstName}, <br>
    </p>
    <p>
      We are sorry to see you withdraw from the cohort. We hope everything is well! <br>
    </p>
    <p>
    Don't worry, though, if you can't join this time. We have many more cohorts and skills coming up! <br>
    </p>
    <p>
    Thank you so much! <br>
    </p>
    <p>
      Hacking HR Team
    </p>
    `,
  },
  SKILL_COHORT_EMAIL_ONE_WEEK_BEFORE_IT_STARTS: {
    subject: (cohort, startDate) => `
      One Week to Kick-Off Hacking HR's ProjectX Cohort: ${cohort.title} (Starting on ${startDate})
    `,
    body: (user, cohort) => `
      <p>
        Hi ${user.firstName}, <br>
      </p>
      <p>
        We are only one week away from the kick-off of Hacking HR's ProjectX Cohort: ${cohort.title}<br>
      </p>
      <p>
        We are so excited that you are joining! <br>
      </p>
      <p>
        As you know, we created this tool with one idea in mind: to help you learn or improve your knowledge in ${cohort.title} through daily resources, personal reflections and assessment of your fellow cohort participants’ reflections! <br>
      </p>
      <p>
      This program is intense, but light touch: we will provide a daily resource that you 
      should be able to read, listen or watch in less than 20 minutes. Daily means daily: 
      66 consecutive days. 
      <br>
      </p>
      <p>
      Besides reading, listening or watching the daily resource, you will provide a 
      personal reflection about what you learned and how you plan to apply the lessons 
      learned.
      <br>
      </p>
      <p>
      This cohort program lasts 66 consecutive days. Each day, for 66 consecutive days, 
      you will receive a daily resource and you must provide a reflection about the 
      resource. The reflection should address the question: “what did I learn from this 
      resource and how can I apply it in my day to day practice/work?” 
      <br>
      </p>
      <p>
      Reading, listening or watching the resource and providing the reflection shouldn’t 
      take more than 20-25 minutes per day... Hey, “excellence is a habit”... and we aim 
      to make light-touch learning a habit with discipline and commitment. <br>
      </p>
      <p>
      As I mentioned before, the program relies on daily consistency and discipline. 
      Instead of bugging you with heavy daily resources, “self-pace” learning program for 
      which you disengage too soon or long programs that lasts for hours and months, we
      only ask you for 20-25 minutes or less on a daily basis for 66 days. That’s it!  <br>
      </p>
      <p>
      Don’t forget that you will be removed from the program if you miss to provide your 
      response two times during a given week. This means that you must provide on at 
      least five resources during one week. If you fail this requirement you will be 
      removed from the program and will not have access anymore to the dashboard. We 
      assess the completion of this requirement on Sunday evening (Pacific Time Zone). 
      Before then you should have completed five reflections or more to continue with the
      program the following week. The assessment of the completion of the weekly 
      requirement is an automated process and there is no way to include you again after
      you are removed from the cohort for missing two or more activities.
      </p>

      <p>
      Please note: whether you receive the daily email or not, the resource will be posted 
      somewhere in the strange world of the Internet. If that’s the case, please GO to the 
      in the Cohort dashboard in the Hacking HR LAB. Sometimes our emails get stuck 
      Cohort dashboard and review the resource. You still have to complete the daily 
      activity, even if you don’t receive the daily resource email on a given day.
      </p>

      <p>
      Finally, if you have any trouble accessing the cohort on your mobile device, please 
      try from your computer.
      </p>

      <p>
      Enjoy the program. Happy learning. And please do not hesitate to reach out if you 
      have any questions:  <a href="mailto:enrique@hackinghr.io">enrique@hackinghr.io</a>
      </p>
    
      <p>
        Thank you!
      </p>
      <p>Enrique Rubio</p>
      <p>Founder</p>
      <p>Hacking HR</p>
    `,
  },
  SKILL_COHORT_EMAIL_DAY_BEFORE_IT_STARTS: {
    subject: (cohort, startDate) => `
      This is it! We are kicking off tomorrow! Hacking HR's ProjectX Cohort: ${cohort.title} (Starting on ${startDate})
    `,
    body: (
      user,
      cohort,
      startDate,
      endDate,
      numOfParticipants,
      numOfCountries
    ) => `
      <p>
        Hi ${user.firstName}, <br>
      </p>
      <p>
        This is it, folks! We are kicking off Hacking HR's ProjectX Cohort: ${cohort.title} tomorrow, ${startDate} and will last for 66 consecutive days until ${endDate}.  <br>
      </p>
      <p>
        We wanted to send you a quick summary about what to expect during the program:<br>
      </p>
      <ul>
        <li>For 66 consecutive days you will receive a daily a daily resource that you should be able to read, listen or watch in less than 20 minutes. We will send it via email, every day at 3 a.m. Pacific Time (we are early birds here!). If you don’t receive it, all you have to do is go to the cohort’s dashboard: https://www.hackinghrlab.io/projectx/${cohort.id}/resources and the resource will show.</li>
        <li>After reading, listening or watching the resource, you will provide a personal reflection about what you learned and how you plan to apply the lessons learned.</li>
        <li>Also, daily, you will look at some of the reflections provided by other participants’ and provide your feedback to their reflections.</li>
        <li>In addition, you have access to the participants’ tab where you can see who is part of the cohorts and further connect with them.</li>
      
      </ul>
     
      <p>
      You already know this: ProjectX relies on daily consistency and discipline. Instead of 
      bugging you with heavy daily resources, “self-pace” learning program for which you
      disengage too soon or long programs that lasts for hours and months, we only ask 
      you for 20-25 minutes or less on a daily basis for 66 days. That’s it! <br>
      </p>
      <p>
      Don’t forget that you will be removed from the program if you miss to provide your 
      response two times during a given week. This means that you must provide on at 
      least five resources during one week. If you fail this requirement you will be 
      removed from the program and will not have access anymore to the dashboard. We 
      assess the completion of this requirement on Sunday evening (Pacific Time Zone). 
      Before then you should have completed five reflections or more to continue with the
      program the following week. The assessment of the completion of the weekly 
      requirement is an automated process and there is no way to include you again after
      you are removed from the cohort for missing two or more activities.  <br>
      </p>
      <p>
      
      Please note: whether you receive the daily email or not, the resource will be posted 
      in the Cohort dashboard in the Hacking HR LAB. Sometimes our emails get stuck 
      somewhere in the strange world of the Internet. If that’s the case, please GO to the 
      Cohort dashboard and review the resource. You still have to complete the daily 
      activity, even if you don’t receive the daily resource email on a given day.
      </p>
      <p>
        Last, but not least. This cohort is starting with ${numOfParticipants} participants and they come from ${numOfCountries} countries. So, happy learning and also happy networking! <br>
      </p>
      <p>
        Enjoy the program. And please do not hesitate to reach out if you have any questions: <br>
        <a href="mailto:enrique@hackinghr.io">enrique@hackinghr.io</a> <br>
      </p>
      <p>
        Thank you!
      </p>
      <p>
      Founder
      </p>
      <p>
      Hacking HR
      </p>
    `,
  },
  INVITATION_TO_JOIN: {
    subject: (hostUser, userInvited) =>
      `Hi ${userInvited.name}, ${hostUser.firstName} ${hostUser.lastName} is inviting you to join the Hacking HR 2022 Global Online Conference`,
    body: (hostUser, userInvited, link) => `
  <p>
  Hi ${userInvited.name}!<br>
  </p>
  <p>
  How are you?
  </p>
  <p>
  Hey, we wanted to let you know that ${hostUser.firstName} ${hostUser.lastName} would love for you to 
  join the Hacking HR 2022 Global Online Conference “HR Innovation and Future of 
  Work”.
  </p>
  <p>
  Join here: <a href="${link}">${link}</a><br>
  </p>
  <p>
  Hacking HR’s Global Online Conference is the most robust HR event in the world. 
  </p>
  <p>
  It includes more than 300 sessions with over 500 speakers from all over the world. 
  The event includes over 80 tracks with 3 panels each one, dozens of presentations 
  and roundtable conversations, and countless networking opportunities.
  </p>
  <p>
  The entire content of the conference during and post-event is FREE!
  </p>
  <p>
  And for our premium members in the Hacking HR LAB: in addition to all the content 
  of the conference, you can also earn HR certification credits (more than 500 credits 
  available for the event!).
  </p>
  <p>
  Join us! 
  </p>
  <p>   
    Hacking HR Team
  </p>
  `,
  },
  USER_CONFIRM_ACCESSIBILITY_REQUIREMENTS: {
    subject: `User confirm accessibility requiriments`,
    body: (user) => `
  <p>
  ${user.firstName} ${user.lastName} <br>
  </p>
  <p>
  ${user.email}<br>
  </p>
  </p>
  <p>
    Hacking HR Team
  </p>
  `,
  },

  USER_BECOME_BUSINESS_PARTNER: {
    subject: `User want apply to the business partner community`,
    body: (user, link, applyState) => `
  <p>
   ${user.firstName} ${user.lastName} <br>
  </p>
  <p>
  <strong>Email:</strong> ${user.email}<br>
  </p>
  <p><strong>Company:</strong> ${user.company}</p>
  <p><strong>Company size:</strong> ${user.sizeOfOrganization}</p>
  <p></p>
  <p>
    <strong>Linkedin:</strong> ${user.personalLinks.linkedin}<br>
  </p>
  <h3>${applyState ? applyState : ""}</h3>
  </p>
  <div>
    Accept: <a href="${link}&accepted=true">${link}</a><br>
    Reject: <a href="${link}&accepted=false">${link}</a><br>
  </div>
  <p>
    Hacking HR Team
  </p>
  `,
  },

  USER_BECOME_SPEAKER_2023: {
    subject: `User want apply to the speakers2023 community`,
    body: (
      firstName,
      lastName,
      email,
      company,
      sizeOfOrganization,
      personalLinks,
      link
    ) => `
      <p>
      ${firstName} ${lastName} <br>
      </p>
      <p>
      <strong>Email:</strong> ${email}<br>
      </p>
      <p><strong>Company:</strong> ${company}</p>
      <p><strong>Company size:</strong> ${sizeOfOrganization}</p>
      <p></p>
      <p>
        <strong>Linkedin:</strong> ${personalLinks.contact}<br>
      </p>
      </p>
      <div>
        <a href="${link}&accepted=true">${"Accept"}</a><br>
        <a href="${link}&accepted=false">${"Reject"}</a><br>
      </div>
      <p>
        Hacking HR Team
      </p>
    `,
  },

  USER_ACCEPTED_SPEAKER: {
    subject: (firstName) =>
      `${firstName}: your application to join us as speaker at FORWARD2023 has been approved! Please select the panels you want to join. Thank you!`,
    body: (user) => `
      <p>
        Hi ${user.firstName},
      </p>
      <p>
        I am excited that you are joining us as a speaker at Hacking HR’s <b>FORWARD2023</b>! 
      </p>
      <p>
        We are planning an amazing conference experience and we are thrilled to have you with us. 
      </p>
      <p>
        This is what comes next: 
      </p>
      <p>
        <ol>
          <li>Please go to this link: https://www.hackinghrlab.io/speakers2023</li>
          <li>The panels are listed in that link. We may add more panels later on, but those are the ones we have for now. </li>
          <li>Please join one or up to two panels. Just click on “JOIN”. If you click on “More Information” you will be able to see the rest of the panelists for that panel. Each panel has up to five panelists and a moderator. You can join up to two panels. Please I kindly ask you to make sure you are selecting the panel you are interested to join. Withdrawing from a panel later creates a lot of problems!</li>
          <li>The panels will be recorded no later than the end of this year and released during the conference. Your panel’s moderator will be in touch within the next few weeks to schedule the logistics and recording.</li>
        </ul>
      </p>
      <p>
        Please add your name to the panels no later than August 26th. We will close the system by then and you won’t be able to join anymore.
      </p>
      <p>
        Please do let me know if you have any questions. 
      </p>
      <p>
        Thank you so much for being part of this experience! 
      </p>
      <br />
      Enrique Rubio
      <br />
      Founder
      <br />
      Hacking HR
      <br />
    `,
  },

  USER_REJECT_SPEAKER: {
    subject: `You have been rejected for speakers 2023.`,
    body: (user) => `
      <p>
      Hi ${user.firstName} ${user.lastName} <br>
      </p>
      <p>Thank you for apply to speakers 2023, unfortunately, your permissions have been rejected</p>
      <p>
        Hacking HR Team
      </p>
    `,
  },

  USER_IS_WITHDRAW: {
    subject: `One speakers is withdraw of one panel`,
    body: (firstName, lastName, panelName) => `
      <p>${firstName} ${lastName}</p>
      <p>${panelName}</p>
      `,
  },

  ATTENDEE_CHANNEL: {
    subject: (subject) => `${subject}`,
    body: (message, nameChannel) => `
      ${message}
      <p>You are receiving this email because you follow ${nameChannel} in the Hacking HR LAB</p>
    `
  },

  ATTENDEE_EVENT: {
    subject: (subject) => `${subject}`,
    body: (message) => `
      ${message}
    `
  },

  ATTENDEE_EVENT_1HOURBEFORE: {
    subject: (title) => `REMINDER: ${title} is starting in ONE hour! `,
    body: (title, link) => `
      <p>Hi {{contact.FIRSTNAME}},</p>
      <p>We are about to start the Hacking HR’s event: ${title}.</p>
      <p>We are kicking off in one hour and we are excited to have you with us!</p>
      <p>Please use this link to connect: ${link}.</p>
      <p>Note that if you connect more than ten minutes earlier in the link above it may not be active yet. The link will be active at the start time of the event.</p>
      <p>Also, please note that our events are generally set up in Pacific Time Zone.</p>
      <p>Are you on the west coast of Canada, the United States or Mexico? If not, then you are not in Pacific Time.</p>
      <p><a href="https://www.timeanddate.com/">Click on this link</a> to convert the time from Pacific Time Zone to your own time zone.</p>
      <p>Thank you so much. Please let us know if you have any questions!</p>
      <p>Hacking HR Team</p>
    `
  },

  ATTENDEE_EVENT_24HOURBEFORE: {
    subject: (title) => `REMINDER: ${title} is starting in 24 hours! `,
    body: (title, link, startingDate, startingTime, timezone, endDate, endTime) => `
      <p>Hi {{contact.FIRSTNAME}},</p>
      <p>We are excited that you are joining us at Hacking HR’s event: ${title}.</p>
      <p>The event is starting in 24 hours!</p>
      <p>Start date and time: ${startingDate} at ${startingTime} (${timezone})</p>
      <p>End date and time: ${endDate} at ${endTime} (${timezone})</p>
      <p>Please use this link to connect: ${link}.</p>
      <p>Note that if you connect more than ten minutes earlier in the link above it may not be active yet. The link will be active at the start time of the event.</p>
      <p>Also, please note that our events are generally set up in Pacific Time Zone.</p>
      <p>Are you on the west coast of Canada, the United States or Mexico? If not, then you are not in Pacific Time.</p>
      <p><a href="https://www.timeanddate.com/">Click on this link</a> to convert the time from Pacific Time Zone to your own time zone.</p>
      <p>Thank you so much. Please let us know if you have any questions!</p>
      <p>Hacking HR Team</p>
    `
  },

  SEND_CETIFICATE_CODE: {
    subject: (title) => `More information about your Digital Certificate of Attendance for the event ${title}`,
    body: (firstName, code, title) => `
      <p>Hi ${firstName},</p>
      <p>Thank you for confirming that you attended all the sessions corresponding to Hacking HR’s event: ${title}.</p>

      <p>We hope you proudly share your certificate of attendance.</p>
      
      <p>In addition, you can also add this information as part of your accomplishments in the “Licenses and Certifications” section on LinkedIn or on your resume.</p>
      
      <p>If you choose to do so, please use the following information:</p>

      <p>Unique digital certificate ID: ${code}</p>
      <p>Unique URL: <a href="${process.env.DOMAIN_URL}verify/${code}" target="_blank">${process.env.DOMAIN_URL}verify/${code}</a></p>
      
      <p>Expiration date: never.</p>

      <p>We hope that this certificate helps you continue furthering your professional development.</p>

      <p>Thank you so much!</p>

      <p>Hacking HR Team</p>
    `
  },

  SEND_EMAIL_INVITE: {
    subject: (firstName, lastName, channelName) => `${firstName} ${lastName} is inviting you to follow his channel in the Hacking HR LAB: ${channelName}`,
    body: (name, firstName, lastName, nameChannel, linkChannel, categories) => `
      <p>Hi ${name},</p>
      <p>${firstName} ${lastName} is inviting you to follow their channel in the Hacking HR LAB: <a href="${process.env.DOMAIN_URL}${linkChannel}" target="_blank">${nameChannel}</a></p>
      <p>${firstName} regularly posts content about ${categories}.</p>
      <p>Please click on the link above, log in the Hacking HR LAB, and follow ${firstName}’s channel!</p>

      <p>Thank you!</p>
      <p>${firstName} ${lastName}</p>
      <p><a href="${process.env.DOMAIN_URL}${linkChannel}" target="_blank">${nameChannel}</a></p>
    `
  },

  NOTIFICATION_NEW_CONTENT_CHANNEL: {
    subject: `New Creator Content`,
    body: (
      channelName,
      channelAdmin,
      channelAdminEmail,
      contentType,
      name,
      link
    ) => `
      <p><b>Channel name:</b> ${channelName} </p>
      <p><b>Channel admin:</b> ${channelAdmin} </p>
      <p><b>Channel admin email:</b> ${channelAdminEmail} </p>
      <p><b>Content type:</b> ${contentType} </p>
      <p><b>Name:</b> ${name} </p>
      <p><b>Link:</b> ${link} </p>
    `,
  },

  REJECT_USER_APPLY_PARTNER_BUSSINESS: {
    subject:
      "Your Application for Hacking HR’s HR Business Partners Community was not approved",
    body: (user) => `
  <p>
  </p>
  <p>
  Hi ${user.firstName}
  </p>
  <p>
  Thank you for sending your application to be part of the HR Business Partners 
  Community. 
  </p>
  <p>
  We built this community specifically for HR professionals who currently are HR Business Partners or, even if they don’t have the “official” HR Business Partner title, are performing HR Business Partnering functions.
  </p>
  <p>
  In reviewing your Hacking HR LAB profile we don’t see that you are either an HR Business Partner or performing those functions. We may be missing something. That happens. In that case, please let us know if we made a mistake so that we can reconsider your application. To do this, please send the application again and make sure to add any new information in the comment box provided in the application.
  </p>
  <p>
  There are still many tools for you to enjoy in the Hacking HR LAB and we hope you 
  do! 
  </p>
  <p>Thank you so much.</p>
  <p>
  The Hacking HR Team
  </p> 
    `,
  },
  ACCEPT_USER_APPLY_PARTNER_BUSSINESS: {
    subject: "Welcome to the HR Business Partners Community by Hacking HR",
    body: (user, link) => `
    Hi ${user.firstName}
  </p>
  <p>
  We are excited to welcome you to the HR Business Partners Community in the 
  Hacking HR LAB. 
  </p>
  <p>
  This space is dedicated to the community of HR Business Partners and our hope is 
  for it to become a place for learning, collaboration, community, support and much 
  more!
  </p>
  <p>
  In the HR Business Partners community you will be able to share resources, join 
  conversations, upload and download valuable documents created by the 
  community, join project conversations, connect with other HR Business Partners, 
  help each other and a lot more.
  </p>
  <p>
  We will be including more tools for collaboration, community and learning in the 
  Community of HR Business Partners. This is just the beginning! 
  </p>
  <p>
  To access the HR Business Partners Community dashboard, please click on your 
  profile (top right) and there will be a button: “HR Business Partners Community”. If 
  you are a PREMIUM member of the Hacking HR LAB, you can access right away. If 
  not, you have to UPGRADE your account first to have access to the dashboard.
  </p> 
  <p>
  If there is anything that you believe can be of value to you and the community... 
  well... don’t hesitate to let me know!
  </p>
  <p>
  Thank you so much! And please remember to be an active member of the 
  community. 
  </p>
  <p>Enrique Rubio</p>
  <p>Founder</p>
  <p>Hacking HR</p>`,
  },
  USER_AFTER_APPLY_BUSINESS_PARTNER: {
    subject: `Your Application for the Hacking HR’s HR Business Partners Community has been received`,
    body: (user) =>
      `<p>Hi ${user.firstName},</p>
      <p>Thank you for sending your application to be part of the HR Business Partners 
      Community.</p>
      <p>We will review your application and you should receive a response within the next 
      48 hours.</p> 
      <p>Thank you so much.</p> 
      <p>The Hacking HR Team</p>`,
  },
  USER_AFTER_APPLY_SPEAKER_2023: {
    subject: (firstName) =>
      `${firstName} your application to join us as speaker at FORWARD2023 has been received`,
    body: (firstName) =>
      `<p>Hi ${firstName},</p>

      <p>I have received your application to join us as a speaker at the Hacking HR 2023 Global Conference, now called: <b>FORWARD 2023</b>.</p>

      <p>I review all the applications to make sure we are only including approved speakers. </p>

      <p>You will receive an email shortly with your approval. As soon as your access to the speakers’ dashboard is approved you will be able to see all the sessions (panels) and select one or two that you want to join. </p>

      <p>Thank you!</p>

      <br />
      Enrique Rubio
      <br />
      Founder
      <br />
      Hacking HR
      <br />
      `,
  },
  JOB_POST_INVITATION_TO_APPLY: {
    subject: (jobPost) =>
      `You have been invited to apply to ${jobPost.jobTitle}`,
    body: (user, recruiter, jobPost) => `
      <p>
        Hi ${user.firstName}<br>
      </p>
      <p>
        Thank you for being part of the Hacking HR’s Talent Marketplace! <br>
      </p>
      <p>
        <a href="${recruiter.personalLinks.linkedin}" target="_blank">${recruiter.firstName} ${recruiter.lastName}</a>
        is inviting you to apply for this job: <a href="${jobPost.linkToApply}" target="_blank">${jobPost.jobTitle}</a> <br>
      </p>
      <p>
        We hope this is a good match for you and we wish you not just good luck… but the BEST luck in process! <br>
      </p>
      <p>
        Please do not hesitate to let us know if there is anything we can do to help you. We are here for you! <br>
      </p>
      <p>
        Thank you! <br>
      </p>
      <p>Hacking HR Team</p>
    `,
  },
  NOTIFY_QUALIFIED_USERS_OF_A_JOB_POST: {
    subject: (jobTitle) => `Maybe this job is of your interest: ${jobTitle}`,
    body: (user, link) => `
    <p>
      Hi ${user.firstName}<br>
    </p>
    <p>
      Thank you for being part of the Hacking HR’s Talent Marketplace! <br>
    </p>
    <p>
      Based on the criteria and skills you selected in Hacking HR’s Talent Marketplace, we think this job may be of your interest: 
      <a href="${link}" target="_blank">${link}</a>
    </p>
    <p>
      We hope this is a good match for you and we wish you not just good luck… but the BEST luck in process! <br>
    </p>
    <p>
      Please do not hesitate to let us know if there is anything we can do to help you. We are here for you! <br>
    </p>
    <p>
      Thank you! <br>
    </p>
    <p>Hacking HR Team</p>
  `,
  },
  USER_BECOME_CREATOR: {
    subject: () => `Thank you for becoming a CREATOR in the Hacking HR LAB!`,
    body: (user) => `
      <p>
        Hi ${user.firstName},
      </p>
      <p>
        We are excited to welcome you as a CREATOR in the Hacking HR LAB. 
        CHANNELS functionality was built for CREATORS like you. And this is just the beginning.
      </p>
      <p>
        We are firm believers in the unlimited opportunities of the creators' economy and we are planning to deliver a lot of resources for CREATORS like you.
      </p>
      <p>
        In particularly, our aim is to create the technology to create, share and monetize content designed for HR professionals by our community of CREATORS!
      </p>
      <p>
        For now, <a href="https://www.youtube.com/watch?app=desktop&v=DpCqM42fWRE" target="_blank" >please check out this video to learn how to use the existing CREATORS platform</a>. 
      <p>
      <p>
        Please do not hesitate to let us know if you have any questions.
      </p>
      <p>
        We are here to help you and we hope that this tool (what already exists and what will exist soon!).
      </p>
      <p>
        Thank you so much!
      </p>
      <br />
      The Hacking HR Team
    `,
  },
  USER_BECOME_RECRUITER: {
    subject: () => `Thank you for becoming a RECRUITER in the Hacking HR LAB!`,
    body: (user) => `
      <p>
      Hi ${user.firstName},
      </p>
      <p>
        We are excited to welcome you as a recruiter in the Hacking HR LAB.
      </p>
      <p>
        The Talent Marketplace functionality was built for recruiters like you to take full advantage of the Talent Marketplace we are building inside the LAB.
      </p>
      <p>
        You can post your jobs by click on Talent Marketplace (left menu) and then going to the “My Job Postings” tab.
      </p>
      <p>
        This is what we are building now and it's coming up in a few days:
      </p>
      <p>
        <ul>
          <li>Members in the LAB who match your job criteria will be notified</li>
          <li>You will be able to access a list of recommended candidates for your job instead of looking through the entire Talent Marketplace</li>
          <li>Your job will be posted across our social media channels (this one is coming in a few weeks)</li>
          <li>We will find matching candidates in our social media channels and invite them to apply (this one is also coming in a few weeks)</li>
        </ul>
      </p>
      <p>
        For now, please do not hesitate to let us know if you have any questions. We are here to help you and we hope that you can find amazing talent in the Hacking HR's Talent Marketplace!
      </p>
      <p>
        Thank you so much!
      </p>
      <br />
      The Hacking HR Team
    `,
  },
  USER_CONFIRM_LIVE_ASSISTENCE: {
    subject: (event) =>
      `Thank you for confirming your participation to Day ${event.firstDay} of ${event.allDays} at Hacking HR’s ${event.name}`,
    body: (user, event) => `
    <p>
    Hi ${user.firstName},
    </p>
    <p>
    Thank you for confirming your participation today.
    </p>
    <p>
    Please keep in mind that this event lasts ${event.allDays} days and you must attend to all the 
    sessions and days during the event to claim a Digital Certificate of Participation. 
    Watching the recorded videos after the event is not conducive to a Digital 
    Certificate of Participation.
    </p>
    <p>
    Today is Day  ${event.firstDay} of ${event.allDays} days of the event!.
    </p>
    <p>
    Your Digital Certificate of Participation will be available at the end of the event 
    (after the last session!) if you CONFIRM your participation in all days of this event.
    </p>
    <p>
    Thank you!
    </p>
    <p>
    Hacking HR Team
    </p>
  `,
  },
  USER_RENEW_PREMIUM: {
    subject: () =>
      `Thank you for renewing your annual subscription to the Hacking HR LAB!`,
    body: (user) => `
      <p>
      Hi, ${user.firstName}
      </p>
      <p>
        Thank you so much for renewing your annual subscription to the Hacking HR LAB. 
      </p>
      <p>
        You can find your invoice by logging in the Hacking HR LAB and clicking Billing Information under your profile.
      </p>
      <p>
        We have added several exciting features over the past few months and many more tools are in the making. 
      </p>
      <p>
        Please make sure you take full advantage of our learning tools, our events and all the learning content that we have put together for you. 
      </p>
      <p>
        Thank you so much! 
      </p>
      <br />
      The Hacking HR Team
      <br />
    `,
  },
  USER_ACCEPT_TERMS_CONDITIONS_GCONFERENCE: {
    subject: `Thank you for acknowledging and accepting the rules of engagement as part of the Hacking HR 2022 Global Online Conference`,
    body: () => `
    We appreciate you taking the time to carefully read, acknowledge and accept the 
    rules of engagement as part of the learning experience at the Hacking HR 2022 
    Global Online Conference. 
    </p>
    <p>
    We do this to make sure you know from the beginning what to expect from our 
    global online conference.
    </p>
    <p>
    The rules of engagement include:
    </p>
    <p>
    <strong>1. Content:</strong>The content of this conference during and post-event is completely FREE for the members of the 
    Hacking HR LAB. You can get access to the content at any time. However, you 
    must not reproduce totally or partially any part of this content outside of the 
    Hacking HR LAB without our explicit approval.
    </p>

    <p>
    <strong>2. Networking tools:</strong> there are several networking tools in the conference 
    application. Two in particular are very useful: Bonfires and Chat. Bonfires allow 
    you to create conversations with participants of the conference, and with the 
    chat you can connect individually with other participants. The networking tools 
    are for real networking conversations. If you use any of the tools for pitching, 
    marketing or selling any product or service, your account will be banned from 
    using the tools again for the duration of the conference.
    </p>

    <p>
    <strong>3. Conference sessions:</strong> you can’t join more than one session simultaneously 
    with other sessions. As soon as you click on JOIN a session, the option to join any
    other session at the same time and same date will be deactivated. You can join 
    more sessions at other times/dates.
    </p>

    <p>
    <strong>4. HR Credits:</strong> The conference offers more than 500 SHRM+HRCI credits. 
    The credits ARE NOT FREE and NOT transferable or shareable. 
    You MUST UPGRADE your account and become a PREMIUM member to get access to the credits. 
    Please do not email us asking for credit codes if you are not a PREMIUM user. 
    If you are a PREMIUM user, this is how it’ll work: two weeks after the conference 
    you will receive an email to download your personalized conference participation report. 
    This report will include the sessions you joined and ONLY the corresponding HRCI/SHRM codes to those sessions. 
    There is no need to email us asking for the codes. Also, please note that you SHOULD NOT share the codes with anyone. 
    Please wait until the report is ready no later than March 28th.
    </p>

    <p>
    <strong>5. Certificate of participation:</strong> a personalized certificate of participation will be 
    available to all members of the Hacking HR LAB. You can download it and also 
    share it in your social media. This certificate of participation will include all the 
    sessions you joined and the amount of hours you invested in your learning. The 
    certificate of participation will be available at the same time as your conference 
    participation report no later than March 28th.
    </p>

    <p>
    Thank you so much and enjoy the conference! We would love to hear your feedback
    afterward!
    </p>

    <p>
    THANK YOU!
    </p>
    <p>
    <br />
    Enrique Rubio
    <br />
    Founder
    <br />
    Hacking HR
    <br />
    `,
  },
  EVENT_JUST_END: {
    subject: (event) =>
      `Your Digital Certificate of Participation for joining Hacking HR’s ${event.title} is available for download`,
    body: (user, event, link) => `
    <p>
    Hi ${user.firstName},
    </p>
    <p>
    Thank you for joining us during all the sessions at Hacking HR’s ${event.title}.
    </p>
    <p>
      We hope that it was an exciting learning experience for you and that you took away 
      great and actionable insights to put into practice in your role.
    </p>
    <p>
      You can now download your Digital Certificate of Participation. Go to the 
      <a href="${link}" target="_blank">Hacking HR LAB</a>, click on your profile and then on My Learning. Then go to the tab “Digital 
      Certificates” to download.
    </p>
    <p>
      Thank you! We hope to see you in future events!
    </p>
    <p>
      Hacking HR Team
    </p>
  `,
  },
  MATCHMAKE_USERS: {
    subject: () => `Match user`,
    body: (matchedUser, advertiser, message) => `
      <p>
        Advertiser: ${advertiser.firstName} ${advertiser.lastName} <br/>
        Advertiser Email: ${advertiser.email} <br />
        Advertiser Message: ${message} <br />
      </p>

      <p>
        Matched User: ${matchedUser.firstName} ${matchedUser.lastName} <br/>
        Matched User Title: ${matchedUser.titleProfessions} <br/>
        Matched User Company: ${matchedUser.company} <br/>
        Matched User LinkedIn: ${matchedUser.personalLinks.linkedin} <br/>
      </p>
    `,
  },
  USER_BECOME_ADVERTISER: {
    subject: () =>
      `Thank you for purchasing your ADVERTISER add-on in the Hacking HR LAB!`,
    body: (firstName) => `
      <p>
        Hi ${firstName},
      </p>

      <p>We are excited to welcome you as “ADVERTISER” in the Hacking HR LAB (yes, we need to come up with a better name for this role!). </p>

      <p>This functionality was built to let people like you run marketing campaigns in the Hacking HR LAB.</p>

      <p>The most effective marketing campaigns are those with a compelling story and a strong call to action behind it. For example, links to great content or events. </p>

      <p>This is how you can start creating your marketing campaigns: </p>
      <ol type="1">
        <li>Click on “Partners Dashboard” under your profile</li>
        <li>In the first tab you can create a new campaign and see the dashboard with your created campaigns</li>
      </ol>

      <p>Each campaign requires that you enter the start and end date, an image at 1:1 resolution, a link and the page in which the campaign will be posted. We calculate the number of credits you need depending on the number of days and the page to post the campaign. </p>

      <p>We recommend that you run your campaign for no less than ten days. </p>

      <p>You will receive an email when you create and active your campaign, when your campaign starts and ends. We will send you an email when your campaign has ended which will include the number of impressions and clicks the campaign generated. </p>

      <p>For now, please do not hesitate to let us know if you have any questions. We are here to help you and we hope that you can generate great traction to your call to action.</p>

      <p>Thank you so much! </p>

      <p>The Hacking HR Team</p>
    `,
  },
  NEW_LIBRARY_CONTENT_FOR_APPROVAL: {
    subject: () => `New Library Content for Approval`,
    body: (title, user) => `
      <p>
        Title: ${title}
      </p>

      <p>
        User: ${user.firstName} ${user.lastName}
      </p>
    `,
  },
  THANK_YOU_PARTICIPATION_PROJECT_X: {
    subject: (cohort, date) =>
      `Thank you for joining Hacking HR’s ProjectX: ${cohort.title}. Your Digital Certificate of Completion will be available on ${date}`,
    body: (cohort, user, date) => `
      <p>
      Hi, ${user.firstName}
      </p>
      <p>
      Thank you for joining Hacking HR’s ProjectX ${cohort.title}.  
      </p>
      <p>
      You are almost there! Please remember to complete this week’s required activities!  
      </p>
      <p>
      Upon completion of the last activities of the program, your Digital Certificate of Completion will be available on ${date}
      </p>
      <p>
        We have many more cohorts focused on other skills that are open now or will open soon! Please join us and continue your learning journey with Hacking HR!.
      </p>
      <p>
      Also, we would love to hear your feedback. Please let us know how we can make this program better for you and the rest of the participants. Just respond to this email letting us know your suggestions! 
      </p>
      <p>
      By next Monday ${date} you will have access to a Digital Certificate of Completion if you complete the rest of this week’s activities. Just go back to the Hacking HR LAB ProjectX’s module, and in the dashboard click on Digital Certificate in the completed cohort. 
      </p>
      <p>
        Thank you so much! 
      </p>
      <br />
      Hacking HR LAB
      <br />
      `,
  },
  NOTICE_NEW_MESSAGE_MODERATOR: {
    subject: (firstName, panelName) =>
      `Hi ${firstName}, in the event: ${panelName}`,
    message: (name, lastName) =>
      `<p>There is a new message from: ${name} ${lastName}</p>`,
  },
  COUNCIL_EVENT_JOIN: {
    subject: (firstName, panelName, eventName) =>
      `${firstName}, thank you for joining the panel: ${panelName} as part of the event ${eventName}`,
    body: (firstName, event, panel, abbr) => `
    <p>
      Hi ${firstName},
      </p>
      <p>
      Thank you for joining as a panelist in the panel: ${panel.panelName} which starts on ${panel.startDate} at ${panel.startTime} ${abbr} and ends on ${panel.endDate} at ${panel.endTime} ${abbr}.  
      </p>
      <p>
      This panel is part of the event ${event.eventName} (starting on ${event.startDate} and ending on ${event.endDate}). 
      </p>
      <p>
      The link to connect to this panel is: ${panel.linkToJoin}
      </p>
      <p>
      You will soon receive the calendar invite from my account: enrique.hackinghr@gmail.com. Please stay tuned and make sure to add my email to your contacts so that the calendar invite doesn’t go to spam.
      </p>
      <p>
      Thank you so much and please stay tuned for more information coming in soon to prepare for the panel. 
      </p>
      <p>
        Thank you so much! 
      </p>
      <br />
      Enrique Rubio
      <br />
      Founder
      <br />
      Hacking HR
      <br />
      `,
    addedByAdminBody: (firstName, event, panel, abbr) => `
    <p>
      Hi ${firstName},
      </p>
      <p>
      Thank you for joining as a panelist in the panel: ${panel.panelName} which starts on ${panel.startDate} at ${panel.startTime} ${abbr} and ends on ${panel.endDate} at ${panel.endTime} ${abbr}.  
      </p>
      <p>
      This panel is part of the event ${event.eventName} (starting on ${event.startDate} and ending on ${event.endDate}). 
      </p>
      <p>
      The link to connect to this panel is: ${panel.linkToJoin}
      </p>
      <p>
      Thank you so much and please stay tuned for more information coming in soon to prepare for the panel. 
      </p>
      <p>
        Thank you so much! 
      </p>
      <br />
      Enrique Rubio
      <br />
      Founder
      <br />
      Hacking HR
      <br />
      `,
  },
  ADD_EXPERTS_COUNCIL_ENRIQUE: {
    subject: () =>
      `ADD EXPERTS COUNCIL`,
    body: (email,firstName,lastName,company,titleProfessions,recentJobLevel,sizeOfOrganization,personalLinks) => `
      <p>
        nombre: ${firstName}        
      </p>
      <p>
        apelido: ${lastName}        
      </p>
      <p>
        company: ${company}        
      </p>
      <p>
        email: ${email}
      </p>
      <p>
        title: ${titleProfessions}        
      </p>
      <p>
        linkedin: ${personalLinks.linkedin}        
      </p>
      <p>
        company size: ${sizeOfOrganization}
      </p>
    `,
  },
  ADD_EXPERTS_COUNCIL: {
    subject: () =>
      `Thank you for sending your request to join the Hacking HR’s Experts Council`,
    body: (firstName) => `
      <p>
        Hi ${firstName},
      </p>
      <p>Thank you for applying to join us at the Hacking HR’s Experts Council!</p>
      <p>We received your request and you will receive a response within the next 48 hours. </p>
      <p>Please note that to be considered for the Council you have to be an HR leader (director, VP, SVP or CHRO/CPO) in a company with more than 50 employees. We are not including consultants or HR tech vendors at the moment. </p>
      <p>We will get back to you soon!</p>
      <p>Thank you!</p>
      <p>Hacking HR Team</p>
    `,
  },
  SPEAKERS_PANEL_JOIN: {
    subject: (firstName, panelName) =>
      `${firstName}: thank you for joining the panel “${panelName}” as part of Hacking HR’s FORWARD2023`,
    body: (firstName, panel) => `
      <p>
        Hi ${firstName},
      </p>
      <p>
        You have joined the panel “${panel.panelName}” as part of Hacking HR’s <b>FORWARD2023</b> agenda.   
      </p>
      <p>
      <p>
        Thank you so much! 
      </p>
      <p>
        The panel moderator will be in touch with you and your fellow panelists starting at the end of August to coordinate the panel logistics and schedule the recording. 
      </p>
      <p>
        Please do let me know if you have any questions. 
      </p>
      <p>Thank you so much for being part of this experience!</p>
      <br />
      Enrique Rubio
      <br />
      Founder
      <br />
      Hacking HR
      <br />
      `,
  },
  SPEAKERS_PANEL_JOIN_FOR_ADMIN: {
    subject: (firstName, panelName) =>
      `${firstName}: you have been added as a speaker in the panel “${panelName}” as part of Hacking HR’s FORWARD2023`,
    body: (firstName, panel) => `
      <p>
        Hi ${firstName},
      </p>
      <p>
        You have been added as a speaker in the panel “${panel.panelName}” as part of Hacking HR’s <b>FORWARD2023</b> conference. 
      </p>
      <p>
      <p>
        We are planning an amazing conference experience and we are thrilled to have you with us. 
      </p>
      <p>
        The panels will be recorded no later than the end of this year and released during the conference. Your panel’s moderator will be in touch within the next few weeks to schedule the logistics and recording.  
      </p>
      <p>
        Please do let me know if you have any questions. Thank you so much for being part of this experience! 
      </p>
      <br />
      Enrique Rubio
      <br />
      Founder
      <br />
      Hacking HR
      <br />
      `,
  },
  SPEAKERS_PANEL_JOIN_FOR_ADMIN_MODERATOR: {
    subject: (firstName, panelName) =>
      `${firstName}: you have been added as moderator in the panel “${panelName}” as part of Hacking HR’s FORWARD2023`,
    body: (firstName, panel) => `
      <p>
        Hi ${firstName},
      </p>
      <p>
        You have been added as moderator in the panel “${panel.panelName}” as part of Hacking HR’s <b>FORWARD2023</b> conference.  
      </p>
      <p>
      <p>
        I will be in touch with more details soon! 
      </p>
      <p>
        Please do let me know if you have any questions. Thank you so much for being part of this experience!   
      </p>
      <br />
      Enrique Rubio
      <br />
      Founder
      <br />
      Hacking HR
      <br />
      `,
  },
  INVITE_CHALLENGUE:{
    subject: (challenge,firstName,lastName) =>
      `${firstName} ${lastName} is inviting you to join the Hacking HR challenge: ${challenge?.title}`,
    body: (challenge,firstName,lastName) => `
      <p>
       ${firstName} ${lastName} is inviting you to check out the Hacking HR challenge: <b>"${challenge?.title}"</b>.
      </p>
      <p>This is how:</p>
      <ol>
        <li>Go to the Hacking HR LAB: https://www.hackinghrlab.io/</li>
        <li>Sign up and create your new account or log in to your existing account</li>
        <li>Click here to go to the challenge: https://www.hackinghrlab.io/challenge/${challenge?.id}</li>
      </ol>
      <p>We hope you join us!</p>
      <P>Thank you! </p>
      <p>Hacking HR Team</p>
      <br />
      `,
  },
  EMAIL_REMINDER_ACTIVITY:{
    subject: (firstName,challenge) =>
    `${firstName}! Check out today’s activity as part of the Hacking HR challenge: ${challenge?.title}`,
    body: (firstName,challenge,activity) => `
      <p>
        Hi ${firstName},
      </p>
      <p>
        Today’s activity as part of the Hacking HR challenge <b>"${challenge?.title}"</b> is:
      </p>
      <p>${activity?.title}</p>
      ${activity?.description}
      <p>Let us know how it goes! And please remember to go the dashboard and mark the activity as completed once you get it done. This is the dashboard’s link: https://www.hackinghrlab.io/challenge/${challenge?.id}</p>
      <P>Thank you! </p>
      <p>Hacking HR Team</p>
      <br />
    `,
  },
  EMAIL_REMINDER_LAST_DAY_CHALENGE:{
    subject: (firstName,challenge) =>
    `${firstName}! Tomorrow is the last day of the Hacking HR challenge: ${challenge?.title}`,
    body: (firstName,challenge) => `
      <p>
        Hi ${firstName},
      </p>
      <p>
        Tomorrow is the last day of the Hacking HR challenge <b>"${challenge?.title}"</b>!
      </p>
      <p>We hope this has been a great experience for you! More importantly, we hope it’s helped you!</p>
      <p>Please remember to go the dashboard and mark your activities as completed! This is the dashboard’s link: https://www.hackinghrlab.io/challenge/${challenge?.id}</p>
      <p>Thank you! </p>
      <p>Hacking HR Team</p>
      <br />
    `,
  },
  EMAIL_REMINDER_DAY_BEFORE_FIRST_DAY_CHALENGE: {
    subject: (firstName,challenge) =>
    `${firstName}! Tomorrow is the first day of the Hacking HR challenge: ${challenge?.title}`,
    body: (firstName,challenge) => `
      <p>
        Hi ${firstName},
      </p>
      <p>
        Tomorrow is the first day of the Hacking HR challenge <b>"${challenge?.title}"</b>!
      </p>
      <p>We are so excited you are here. Actually, we are proud of you for joining this challenge and investing the energy (and a bit of time) to engage in the daily, small activities.</p>
      <p>Please note that we will send you an email reminder for each daily activity. If you don’t receive the email, just go the Challenge page and see the activity there.  Also, we encourage you to mark the activities as completed at the end of each day. You can mark your activities as completed only until the last day of the Challenge.</p>
      <p>Finally, if you complete all your activities, the day after the end of the Challenge we will send you a badge of completion.</p>
      <p>Thank you and have fun in the challenge!</p>
      <p>Hacking HR Team</p>
      <br />
    `,
  },
  EMAIL_REMINDER_LAST_DAY_CHALLENGE: {
    subject: (firstName,challenge) =>
    `${firstName}! Today is the last day of the Hacking HR challenge: ${challenge?.title}`,
    body: (firstName,challenge) => `
      <p>
        Hi ${firstName},
      </p>
      <p>
        Today is the last day of the Hacking HR challenge <b>"${challenge?.title}"</b>!
      </p>
      <p>Thank you so much for being part of this challenge. How was it for you? Please let us know your experience! You can go to the Challenge page (<b>https://www.hackinghrlab.io/challenge/${challenge?.id}</b>) and share your thoughts in the comment section.</p>
      <p>Please make sure to mark your activities as completed today. You will not be able to mark them as completed as after today.</p>
      <p>For those of you who completed all the activities: tomorrow you will receive a final email and a badge of completion.</p>
      <p>We hope you join us in the upcoming challenges!</p>
      <p>Thank you! </p>
      <p>Hacking HR Team</p>
      <br />
    `,
  },
  EMAIL_REMINDER_AFTER_LAST_DAY_CHALLENGE: {
    subject: (firstName,challenge) =>
    `${firstName}! Congratulations on completing the Hacking HR’s Challenge ${challenge?.title}`,
    body: (firstName,challenge) => `
      <p>
        Hi ${firstName},
      </p>
      <p>CONGRATS CONGRATS CONGRATS!!!</p>
      <p>
        Wooohoooo! Kudos to you for completing the Hacking HR challenge <b>"${challenge?.title}"</b>!
      </p>
      <p>We are so proud of you! THANK YOU for investing time and energy in YOU! This is amazing.</p>
      <p>Now, this is the key of the challenge that we never said before: it may have lasted only a few days but… how can you make it happen, on repeat? How will you incorporate these activities in your daily habits and routines so that you can continue flourishing and thriving? </p>
      <p>Yesterday was not really the end of the challenge, but the true beginning. Now it’s up to you to decide what to do with what you learned during the past few days and how to embed the activities as part of your journey of growth and development.</p>
      <p>For now, please go to the Challenge page (<b>https://www.hackinghrlab.io/challenge/${challenge?.id}</b>), let us know any final thoughts about the challenge in the comment section, and click on “My Badge” to download your badge of completion. This badge will also show in the “My Achievements” section under “My Learning”.  Please make sure you proudly share this badge in your social media!</p>
      <p>Once again, congratulations and we will see you soon. We hope you join us in the upcoming challenges!</p>
      <p>Thank you! </p>
      <p>Hacking HR Team</p>
      <br />
    `,
  },
  THANKS_CHALLENGUE:{
    subject: (challenge,firstName) =>
      `${firstName}: Welcome to the Hacking HR challenge: ${challenge?.title}`,
    body: (challenge,firstName,containerDates,activities,dayAfterTheEndDate) => `
      <p>
        Hi ${firstName},
      </p>
      <p>
        We are so excited to have you with us in our Hacking HR challenge: <b>"${challenge?.title}"</b>.
      </p>
      <p>This is what the challenge is about:</p>
      ${challenge.description}
      <p>This challenge will run from ${containerDates.startDate} to ${containerDates.endDate}</p>
      <p>LIST OF ACTIVITIES: </p>
      ${activities}
      <p>Finally, a few reminders about the rules of engagement as part of this challenge: </p>
      <ul>
        <li> The challenge is about you, not us. Reporting the completion of each activity is an honor system. </li>
        <li> You can report the completion of the activities daily or until the last day of the challenge. The system closes at midnight, Pacific Time, the last day of the challenge and it will not reopen, and there are no exceptions. Please report your completion on time. </li>
        <li> You will receive a badge of completion via email on ${dayAfterTheEndDate}, which is the day after the last day of the challenge. </li>
      </ul>
      <p>Thank you so much for being part of ${challenge?.title} and I truly hope engaging in the activities of this challenge is of value to you. </p>
      <p>Thank you!</p>
      <br />
      Enrique Rubio
      <br />
      Founder
      <br />
      Hacking HR
      <br />
      `,
  },
  COUNCIL_EVENT_AWAIT: {
    subject: (eventName) =>
      `New speaker is requesting approval to join ${eventName}`,
    body: (firstName,eventName,panelName,lastName) => `
        <p>
          ${firstName} ${lastName}
        </p>
        <p>
          ${eventName}
        </p>
        <p>
          ${panelName}
        </p>
      `,
  },
  NEW_PANEL_CONFERENCE_2023: {
    subject: (firstName) =>
      `${firstName}: a new panel has been added to the sessions at Hacking HR’s FORWARD2023. In case you want to join this session!`,
    body: (firstName, panelName) => `
        <p>Hi ${firstName},</p>
        <p>We have added a new panel to the agenda of the Hacking HR 2023 Global Conference, now called: <b>FORWARD 2023</b>!</p>
        <p>The new session is: ${panelName}.</p>
        <p>If you want to be a panelist in this session, please follow this process:</p>
        <p>
          <ol>
            <li>Please go to this link: https://www.hackinghrlab.io/speakers2023</li>
            <li>Search for ${panelName}</li>
            <li>Click on JOIN (note: you can only join up to two panels. If you are already included in two panels you will not be able to join another panel).</li>
            <li>The panels will be recorded no later than the end of this year and released during the conference. Your panel’s moderator will be in touch within the next few weeks to schedule the logistics and recording.</li>
          </ul>
        </p>
        <p>Thank you!</p> 
        <br />
        Enrique Rubio
        <br />
        Founder
        <br />
        Hacking HR
        <br />`,
  },
  REMEMBER_TO_SPEAKERS_COMPLETE_PROFILE: {
    subject: (firstName) =>
      `${firstName}: please complete your speaker profile in the Hacking HR LAB for FORWARD2023`,
    body: (firstName) => `
        <p>Hi ${firstName},</p>
        <p>I am excited that you are in our roster of speakers for the Hacking HR 2023 Global Conference, now called: <b>FORWARD 2023</b>!</p>
        <p>I noticed that you haven’t fully completed your profile in the Hacking HR LAB. Your profile must be fully completed to select the panel(s) in which you want to speak and for your information to show in the Speakers page. </p>
        <p>This is how you can complete your profile: </p>
        <p>
          <ol>
            <li>Go to the Hacking HR LAB: https://www.hackinghrlab.io/</li>
            <li>Click on your profile headshot on the top right and then click on your name</li>
            <li>Click on the orange button COMPLETE PROFILE and complete the missing fields</li>
          </ul>
        </p>
        <p>As soon as you have completed your profile, please go to this link: https://www.hackinghrlab.io/speakers2023 and join the panel(s) in which you want to speak at the conference. </p> 
        <p>Please let me know if you have any questions. Thank you! </p> 
        <br />
        Enrique Rubio
        <br />
        Founder
        <br />
        Hacking HR
        <br />`,
  },
  REMEMBER_TO_SPEAKERS: {
    subject: (firstName) =>
      `${firstName}: you haven’t selected the panel(s) you will join at Hacking HR’s FORWARD2023. Please select soon!`,
    body: (firstName) => `
        <p>Hi ${firstName},</p>
        <p>I am excited that you are in our roster of speakers for the Hacking HR 2023 Global Conference, now called: <b>FORWARD 2023</b>!</p>
        <p>But… we have something missing from you to get things rolling: you need to select the one or up to two panels you want to join at the conference. This is how:</p>
        <p>
          <ol>
            <li>Please go to this link: https://www.hackinghrlab.io/speakers2023</li>
            <li>The panels are listed in that link. We may add more panels later on, but those are the ones we have for now.</li>
            <li>Please join one or up to two panels. Just click on “JOIN”. If you click on “More Information” you will be able to see the rest of the panelists for that panel. Each panel has up to five panelists and a moderator. You can join up to two panels. Please I kindly ask you to make sure you are selecting the panel you are interested to join. Withdrawing from a panel later creates a lot of problems!</li>
            <li>The panels will be recorded no later than the end of this year and released during the conference. Your panel’s moderator will be in touch within the next few weeks to schedule the logistics and recording.</li>
          </ul>
        </p>
        <p>Please add your name to the panels no later than August 26th. We will close the system by then and you won’t be able to join anymore.</p> 
        <p>Let me know if you have any questions.</p> 
        <p>Thank you!</p> 
        <br />
        Enrique Rubio
        <br />
        Founder
        <br />
        Hacking HR
        <br />`,
  },
  REGISTER_CONFERENCE_2023: {
    subject: (firstName) =>
      `${firstName}: Thank you for registering to participate in Hacking HR’s FORWARD2023!  Please read this email with further information.`,
    body: (firstName) => `
        <p>Hi ${firstName},</p>
        <p>I am excited that you are joining us as a participating at Hacking HR’s <b>FORWARD2023</b>!</p>
        <p>We are planning an amazing conference experience and we are thrilled to have you with us.</p>
        <p>Please read some important information below:</p>
        <br/>
        <h1><u>Agenda</u></h1>
        <p>The conference includes: panels, presentations and simulations. All of these sessions are complimentary.</p>
        <p><b>Panels:</b> these are pre-recorded sessions with up to five panelists each one covering interesting topics. Each panelist shares insights and ideas from their own experience.</p>
        <p><b>Presentations:</b> these are short LIVE sessions where presenters will cover a very specific topic in less than 15 minutes.</p>
        <p><b>Simulations:</b> these sessions are the core of the event. A Simulation is a peer-to-peer conversation in small groups. The goal of the Simulation is for a small group of peers to solve a complex business case pertaining to the topic of the Simulation. The business case will be as close as possible to reality so that it resonates with your work and, more importantly, what you learned during the discussions becomes applicable! To participate in this Simulation during the conference you MUST connect via audio and video, otherwise you will not be able to join the session (no exceptions: no video and audio, no simulation).  Each Simulation will last up to three hours (you are expected to participate the full time. We kindly ask you to schedule the time for this. Please do not join unless you can be present during the entire Simulation Sprint).</p>
        <br/>
        <h1><u>Create Your Own Agenda</u></h1>
        <p>Please go to the conference link (<a href="https://www.hackinghrlab.io/conference2023">click here</a>) and start creating your personalized agenda. This is how:</p>
        <p>
          <ol>
            <li>Go to the link above and click on Agenda</li>
            <li>Check the sessions you are most interested in and click on ADD TO MY PERSONALIZED AGENDA</li>
            <li>In “Agenda” you will be able to see both the Full Conference Schedule and your specific agenda (in “My Sessions”). Make sure to download the calendar invite and save  it in your calendar</li>
            <li>During the week of the conference you will get access to the links for each session in “My Sessions” in the Agenda</li>
          </ul>
        </p>
        <p>Note: you can’t add more than one session on the same date at the same time (because, well, you can’t be in two places at once).</p>
        <br/>
        <h1><u>HR Credits</u></h1>
        <p>The panels and simulations at Hacking HR’s <b>FORWARD2023</b> offer hundreds of HR recertification credits (between SHRM and HRCI). The credit codes corresponding to the sessions you are participating in will be ready two weeks after the conference and they will be available in your Hacking HR LAB profile (you don’t need to email us asking for them).</p>
        <p>Two weeks after the conference you will receive an email notifying you that your <b>personalized online participation report</b> is ready. The report will include all the sessions you joined and the codes for the corresponding credits, and also a digital certificate of participation.</p>
        <p><u><b>Please note that you MUST be a PREMIUM member to see the codes in the personalized participation report. If you are not a PREMIUM member the credits will not be visible. To become a PREMIUM member, go to the Hacking HR LAB and click on UPGRADE on the top right to process your membership fees.</b></u></p>
        <p>You can also collect credits by watching the recorded panels after the conference. The recorded panels will be available two weeks after the conference and you can watch the replay and then claim the corresponding credits. You also have to be PREMIUM member to claim the credits of recorded sessions.</p>
        <p><span style="background:#ffff00;">Please note: we will not respond any email asking us why the credits are not free or requesting free credits or requesting the codes to be sent via email, or complaining that the credits are not free. Please be mindful and respectful of this.</span></p>
        <p>Please do let me know if you have any questions. Thank you so much for being part of this experience!</p>  
        <br />
        Enrique Rubio
        <br />
        Founder
        <br />
        Hacking HR
        <br />
        <h1><u>A Request</u></h1>
        <p>Things happen. Technology bugs and glitches occur. And they seem to always happen to us on Day 1 of the conference. Information that we thought was clear may not be that clear. We understand that. And we welcome your requests for additional information or your reports of tech glitches or bugs.</p>
        <p>But we do request that if you need something from us, your request comes with patience, care, understanding and grace. We are a tiny team, delivering the largest HR conference in the world. Please take this into account when you write us an email to request information or report a technical issue. We will have no tolerance for offensive emails and anyone sending us such an email will be removed from our conference and banned from participation in any Hacking HR events in the future. We appreciate this in more ways that you can imagine. Thank you.</p>
        `,
  },
  USER_PURCHASE_ADVERTISEMENT_CREDITS: {
    subject: (numOfCredits) =>
      `(Hacking HR LAB) Thank you for purchasing ${numOfCredits} credits!`,
    body: (firstName, numOfCredits) => `
      <p>Hi ${firstName},</p>

      <p>We just wanted to send you a quick note to confirm your purchase of ${numOfCredits} to use to create your marketing campaigns in the Hacking HR LAB.</p>

      <p>Do not hesitate to let us know if you have any question.</p>

      <p>Thank you!</p>

      <p>Hacking HR Team</p>
    `,
  },
  USER_PURCHARSE_SIMULATIONS_SPRINTS: {
    subject: (firstName, numOfSimulations) =>
      `${firstName} Thank you for purchasing a package of ${numOfSimulations} Hacking HR’s Simulation Sprints!`,
    body: (firstName, numOfSimulations) => `
    <p>Hi ${firstName},</p>

    <p>Thank you so much for joining our flagship learning program: Simulation 
    Sprints, and purchasing ${numOfSimulations} sprints.</p>

    <p>We hope that you find this learning approach to be useful and valuable. So, 
    this is what’s next:</p>

    <ol>
    <li>Your available Simulation Sprints credits don’t have an expiration date.
    In the menu bar in Simulation Sprints in the <a href="${process.env.DOMAIN_URL}">Hacking HR LAB</a> you will be
    able to see how many you have available.
    </li>

    <li>
    You can sign up for any of the open Simulation Sprints. If you don’t see
    anything of your interest, please wait for the new ones to be posted. 
    We are planning to open one or two Simulation Sprints per month. 
    Please note that you can only withdraw from a Simulation Sprint up to 
    the day before it starts for it not to count toward your available credits.
    You will still be using one available credit if you don’t withdraw on time
    or don’t complete the program requirements.
    </li>
    </ol>

    <p>
    We are excited to have you joining us in this program. Please do let us know 
    any feedback you have! You can find me here: <a href="mailto:webmaster@example.com">enrique@hackinghr.io</a>
    </p>

    <p>Thank you!</p>

    <p>Enrique Rubio</p>
    <p>Founder</p>
    <p>Hacking Hr</p>
  `,
  },
  ADVERTISEMENT_CAMPAIGN_START: {
    subject: () => `(Hacking HR LAB) Your campaign is now LIVE!`,
    body: (user) => `
    <p>Hi ${user.firstName},</p>

    <p>We just wanted to send you a quick note to let you know that your campaign is now LIVE! </p>

    <p>Starting now until the end of your campaign on ${user.endDate} you can only edit the link and image of the campaign. You can’t edit dates or the page you originally selected it to be published. </p>

    <p>We will provide impressions and clicks data at the end of your campaign. </p>

    <p>Do not hesitate to let us know if you have any question. </p>

    <p>Thank you!</p>

    <p>Hacking HR Team</p>
  `,
  },
  ADVERTISEMENT_CAMPAIGN_END: {
    subject: () => `(Hacking HR LAB) Your campaign has now ended.`,
    body: (firstName, numOfImpressions, numOfClicks) => `
    <p>Hi ${firstName},</p>

    <p>We just wanted to send you a quick note to let you know that your campaign has already ended.  </p>

    <p>Your campaign generated ${numOfImpressions} impressions and ${numOfClicks} clicks. </p>

    <p>We hope you continue creating more marketing campaigns in the Hacking HR LAB!</p>

    <p>Thank you!</p>

    <p>Hacking HR Team</p>
  `,
  },
  ADVERTISEMENT_CAMPAIGN_ACTIVE: {
    subject: () =>
      `(Hacking HR LAB) Your campaign has been successfully activated`,
    body: ({
      user,
      startDate,
      startTime,
      endDate,
      endTime,
      days,
      creditsUsed,
      creditsLeft,
      page,
      link,
    }) => `
    <p>Hi ${user.firstName},</p>

    <p>Thank you for creating your marketing campaign in the Hacking HR LAB!</p>

    <p>Your campaign will start on ${startDate} at ${startTime} and end on ${endDate} at ${endTime}, for a total duration of ${days} day/s. For this campaign you are using ${creditsUsed} credits and you have ${creditsLeft} credits left. </p>

    <p>Your campaign will be posted in the ${page} page in the Hacking HR LAB. </p>

    <p>The link of your campaign is: ${link}. </p>

    <p>Now that your campaign is active, you can do the following in the Partners Dashboard</p>
    <ol>
      <li>Edit the link and image of the campaign by clicking the EDIT icon on the right side of your campaign</li>
      <li>See the number of impressions</li>
      <li>See the number of clicks</li>
    </ol>

    <p>Do not hesitate to let us know if you have any question. </p>

    <p>Thank you!</p>

    <p>Hacking HR Team</p>
  `,
  },
  REMINDER_TO_ADD_QUESTION_ONE_WEEK_BEFORE_THE_EVENT: {
    subject: (eventName) => `REMINDER! In one week: ${eventName}`,
    body: (firstName,eventName, event, panels, link, lenght) => `
      <p>Hi ${firstName},</p>

      <p>This is a reminder that ${eventName} is coming up in one week. </p>

      <p>This event is on: ${event.eventCouncilStartDate} at ${event.eventCouncilStartTime} until ${event.eventCouncilEndDate} at ${event.eventCouncilEndTime}. </p>

      <p>You are signed up as a panelist in the panel/s:</p>

      <p>${panels}</p>

      ${(lenght > 1) ? `<p>.</p>

      <p>.</p>` : ``}

      <p>Please make sure you have the calendar invite in your calendar with the corresponding link. </p>

      <p>Also, please add the questions/topics you want the panel to cover. </p>

      <p>You have until one day before the event to do this. This is how: </p>

      <ol>
        <li>Click on this link: ${link}</li>
        <li>Add your comments/questions/suggested topics in your corresponding panel</li>
      </ol>

      <p>Thank you! And see you soon!</p>

      <p>Enrique</p>
    `,
  },
  REMINDER_TO_ADD_QUESTION_ONE_DAY_BEFORE_THE_EVENT: {
    subject: (eventName) => `STARTING TOMORROW: ${eventName}! `,
    body: (firstName, panels, link,lenght) => `
      <p>Hi ${firstName},</p>

      <p>We are kicking this off tomorrow! </p>

      <p>You are signed up as a panelist in the panel/s:</p>

      ${panels}

      ${(lenght > 1) ? `<p>.</p>

      <p>.</p>` : ``}

      <p>Please make sure you have the calendar invite in your calendar with the corresponding link. </p>

      <p>Also, please add the questions/topics you want the panel to cover. </p>

      <p>Today is the last day to add your comments/questions to discuss during the panel. Please note that we will close this file shortly. This is how you can add your comments: </p>

      <ol>
        <li>Click on this link: ${link}</li>
        <li>Add your comments/questions/suggested topics in your corresponding panel</li>
      </ol>

      <p>Thank you! And see you soon!</p>

      <p>Enrique</p>
    `,
  },
  REMIND_PANELIST_ONE_HOUR_BEFORE_THE_EVENT_AND_ATTACH_ALL_COMMENTS: {
    subject: (panelName) =>
      `Your panel ${panelName} is kicking off in one hour! (link and questions/topics included in this email)`,
    body: (firstName, panel, comments, moderatorName, link) => `
      <p>Hi ${firstName},</p>

      <p>Your panel: ${panel.panelName} is kicking off in one hour, at ${panel.startTime}. </p>

      <p>Please connect five minutes before the kick off time. </p>

      <p>This is the link to connect: ${link}. </p>

      <p>Thank you and see you shortly!</p>

      <p>Enrique</p>
    `,
  },
  SEND_DAILY_COMMENTS_TO_MODERATOR: {
    subject: (panelName) =>
      `Here are yesterday's comments on panel ${panelName}`,
    body: (comment) => `
    <p>Hi</p>

    ${comment}
    `,
  },
  EMAIL_ALL_COUNCIL_MEMBERS_WHEN_NEW_EVENT_IS_CREATED: {
    subject: (eventName) =>
      `(For Hacking HR’s Experts Council Founding Members) CALL FOR SPEAKERS! NEW EVENT: ${eventName}`,
    body: (firstName, event, panels) => `
      <p>Hi ${firstName},</p>

      <p>I am excited to share with you that we are planning a new event: ${event.eventName}</p>

      <p>This event is on: ${event.startDate} until ${event.endDate}. </p>
      <p>Check out the ${event.numberOfPanels} panels we will have at the event: </p>

      <p>${panels}</p>

      <p>Do you want to join us? </p>

      <p>This is how: </p>

      <ol>
        <li>Log in the Hacking HR LAB: https://www.hackinghrlab.io/</li>
        <li>Click on Experts Council under your profile, then click on EVENTS</li>
        <li>Click on ${event.eventName}</li>
        <li>Click on JOIN to confirm your participation in the panel of your interest. Please note that you can only join up to ${event.maxNumberOfPanelsUsersCanJoin} panels. </li>
      </ol>

      <p>You will receive an email for each of the panels you join. Just make sure that after clicking on JOIN you download the calendar invite and add it in your calendars. We will not send a separate calendar invite.</p>

      <p>THANK YOU and stay tuned for more information! </p>

      <p>Thank you!</p>

      <p>Enrique</p>
    `,
  },
  JOIN_SIMULATION_SPRINT: {
    subject: (firstName, simulationSprintTitle) =>
      `${firstName}: Thank you for registering for Hacking HR’s Simulation Sprint: ${simulationSprintTitle}`,
    body: (
      firstName,
      simulationSprintTitle,
      simulationSprintStartDate,
      simulationSprintEndDate
    ) => `
    <p>Hi ${firstName},</p>

    <p>Thank you so much for registering for Hacking HR’s Simulation Sprint: ${simulationSprintTitle}.</p>

    <p>This Simulation Sprint starts on ${simulationSprintStartDate} and ends on ${simulationSprintEndDate}. </p>

    <p>
    We are very excited to have you with us in this unique learning program. 
    This is what comes next:
    </p>

    <ol>
    <li>
    The first day of the Simulation Sprint (${simulationSprintStartDate}) you will receive a 
    package that includes: names and contact information of your 
    teammates in your small working team, the business case you and 
    your team will be working on for the next four weeks and the 
    deliverables that you and your team (together) will be submitting each 
    week as required by the program. Also, on day 1 of the Simulation 
    Sprint you will receive the full calendar of the Sprint which includes 
    attached calendar reminders (so that you don’t forget to submit your 
    requirements! This is a no-excuse-learning-program!).
    </li>

    <li>
    Every week you will receive a package of resources in the form of links 
    to available and free resources that we selected and curated for you. 
    The resources in each weekly package were curated to help you 
    navigate the complexity of the business case and, more specifically, 
    help you craft the content of each weekly submission. 
    </li>

    <li>
    Finally, you can go back to the Simulation Sprint’s Dashboard (go to 
      the <a href="${process.env.DOMAIN_URL}">Hacking HR LAB</a>, click on Simulations on the left side menu, then 
      click on My Sprints and Enter Dashboard on the corresponding 
      Simulation Sprint). The dashboard will include a list of the weekly 
      resources, the calendar, your team members and their contact 
      information as well.
    </li>
    </ol>

    <p>
    ${firstName}: I am thrilled you decided to be part of this learning program. 
    We hope it is valuable and, more importantly, that as you go through the 
    program you can also reflect and find ways to apply what you are learning in 
    your own HR practice/job.
    </p>

    <p>
    Do not hesitate to let me know if you have any questions! Reach out to me 
    at any time, for anything you need! I am here: <a href="mailto:webmaster@example.com">enrique@hackinghr.io</a>
    </p>

    <p>Thank you!</p>

    <p>Enrique Rubio</p>
    <p>Founder</p>
    <p>Hackig Hr</p>
    `,
  },
  SIMULATION_SPRINT_REMINDER_24_HOURS: {
    subject: (simulationSprint) =>
      `${simulationSprint.title} is coming up in one day!`,
    body: (user, simulationSprint) => `
      <p>
      Hi, ${user.firstName}
      </p>
      <p>
      We are so excited you are joining us at ${simulationSprint.title}.
      </p>
      <p>
      remember that tomorrow the simulation starts so don't miss it!
      </p>
      <br />
      Thank you!
      <br />
      Hacking HR Team
      <br/>
    `,
  },
  SIMULATION_SPRINT_REMINDER_SAME_DAY: {
    subject: (simulationSprint) => `${simulationSprint.title} starts today!`,
    body: (user, simulationSprint) => `
    <p>
    Hi, ${user.firstName}
    </p>
    <p>
    today we start the simulation ${simulationSprint.title}.
    </p>
    <p>
    Remember to fulfill each of your assignments
    </p>
    <br />
    Thank you!
    <br />
    Hacking HR Team
    <br/>
  `,
  },
};
