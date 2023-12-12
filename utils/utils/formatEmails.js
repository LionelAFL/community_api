const moment = require("moment-timezone");

const formatEmailBlogsPostWeekly = (blogs, resources) => {
  let content = ``;

  let contentResources = ``;

  blogs.forEach((blog) => {
    content += `
    <div style="background: #f5f5f8; padding: 10px 15px; border: 1px solid #e1e2ee;  border-radius: 5px; margin-left: auto; 
    margin-top: 10px; margin-right: auto; width: 500px">
        <h2>${blog.title}</h2>
         <p>t${blog.summary}</p>
         <a href="${process.env.DOMAIN_URL}blogs/${blog.id}">View Blog</a>
         <p>By ${blog.User.firstName} ${
      blog.User.lastName
    } | Posted on ${moment(blog.createdAt).format("MM/DD/YYYY")}</p>
     </div>
      
        `;
  });

  resources.forEach((resource) => {
    contentResources = `
    <div style="background: #f5f5f8; padding: 10px 15px; border: 1px solid #e1e2ee;  border-radius: 5px; margin-left: auto; 
    margin-top: 10px; margin-right: auto; width: 500px">
        <h2>${resource.title}</h2>
         <p>t${resource.summary}</p>
         <a href="${
           resource.link
             ? resource.link
             : `${process.env.DOMAIN_URL}/library-item/podcast/${resource.id}`
         }">View Resource</a>
         <p> Posted on ${moment(resource.createdAt).format("MM/DD/YYYY")}</p>
     </div>
    `;
  });

  return `
  <html>
  <body>
    <div style="width: 600px; display: flex; justify-content: center; margin-left: 450px; margin-right: 300px">
    <div style="width: 100%; padding: 20px; border: 1px solid #e1e2ee; border-radius: 5px">
    <h1 style="text-align: center">Blogs by CREATORS in the Hacking HR LAB</h1>
      
      <div style="width: 100%; text-align: center">
        <p>
            <strong>
                Please check out the latest blog posts by the CREATORS in the Hacking HR LAB
            </strong>
        </p>
      </div>
      
      <div>
      ${content}
       
      </div>

      ${
        contentResources === ""
          ? ""
          : `
          <h1 style="text-align: center">Resources by CREATORS in the Hacking HR LAB</h1>
          <div>
          ${contentResources}
          </div>
          `
      }


    

      <hr style="border: 2px solid #e1e2ee; margin-top: 20px">

      <div style="width: 100%;  margin-top: 20px;">
           <h1 style="margin-top: 20px; text-align: center;">Become a Hacking HR’s CREATOR</h1>

           <p>
            Do you want to share your content (resources, videos, podcasts, events and blog posts) with the 
            thousands of members of the Hacking HR community? The join us as a CREATOR! 
            </p>
           <p>
            As a CREATOR you will have access to sharing your content in your own CREATOR’s 
            channel. We will show a notification in everyone’s profile whenever you share the link to a new 
            resource, video, podcast, event or blog post created in the Hacking HR LAB.
           </p>
           
           <p>
            In addition, every Friday we share a newsletter like this one highlighting all the blog posts that 
            were written in the Hacking HR LAB during the previous week.
           </p>

           <p>
            Go to the <a href="https://www.hackinghrlab.io/">Hacking HR LAB</a> and upgrade your account to PREMIUM + CREATOR to get 
            access to all these tools and many more coming!
           </p>
    </div>

    <hr style="border: 2px solid #e1e2ee">

    <div style="width: 100%;  margin-top: 20px; padding-bottom: 20px;">
        <h1 style="margin-top: 20px; text-align: center;">The Hacking HR's Experts Council</h1>

        <p>
            We are thrilled to invite all Directors, VPs/SVPs, and HR C-suite level leaders in companies 
            with over 100 employees to join us as Founding Members at the Hacking HR's Experts Council!
        </p>

        <p>
            The Expert Council's goal is to provide insights, ideas, recommendations and expertise about 
            very specific topics to the thousands of members of the Hacking HR community and the 
            extended HR global community
        </p>

        <p>
            The Experts Council is also a place for community for senior HR leaders to share and also ask, 
            to be safe while having vulnerable and open conversations about the challenges in HR, and from 
            there to generate insights and ideas and innovations for the extended Hacking HR community!
        </p>

        <p>
            In addition, Founding Members in the Council will always be our priority to invite for our 
            Hacking HR events, particularly our annual global online conference, and also podcasts, and 
            much more! 
        </p>

        <p>
            Almost 400 HR leaders from around the world have already joined, including multinational and 
            local companies, for profit, nonprofit and government institutions, different sectors and 
            industries as well.
        </p>

        <p>
            Do you want to join us? 
        </p>

        <p>
            Are you an HR leader (director, VP/SVP, C-Suite) in an organization with more than 100 
            employees? 
        </p>

        <p>
            Reach out to us: enrique@hackinghr.io, and let us know more about you!
        </p>

        <p>
            <strong>(Please note that at the moment we are not including consultants/vendors in the Council.)</strong>
        </p>
    </div>
    </div>
    </div>
  </body>
</html> 
    `;
};

module.exports = {
  formatEmailBlogsPostWeekly,
};
