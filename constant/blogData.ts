export interface BlogItem {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
  author: string;
  wrapper?: boolean;
}

export interface SideBarItem {
  title: string;
  description: string;
  image: string;
}

// Blog page data
export const blogPageData = {
  pageTitle: "Blog",
  breadcrumbText: "Blog",
  blogData: [
    {
      id: "1",
      title: "4 Top Fundraising Challenges for Youth Activities",
      description:
        "School fundraising is an important aspect of raising money for a variety of activities, events, and programs. That being said, organizing the classic car wash or bake sale fundraiser can be more trouble than it's worth. Parents are too busy managing family obligations, social commitments, and working on their career goals. Children are often booked solid with school work, sports practice, and extracurricular activities. Gone are the days of organizing walk-a-thons, silent auctions, and raffles. In today's busy world, nobody has time to coordinate groups of people, secure a location, gather supplies, and pray for good weather. For all that effort, the return is quite meager. While these are all good ideas, they come with their own set of challenges. And so this demands a new approach to youth activities fundraising. Before we delve into what makes school fundraisers successful, let's review the top fundraising challenges for youth activities.",
      image: "/assets/images/blog1.png",
      date: "Jul 06, 2021",
      author: "Marie Caphlish",
      wrapper: true,
    },
    {
      id: "2",
      title: "Poor Planning",
      description:
        "No matter how small, every fundraiser requires some planning. Poor planning is one of the main reasons why many fundraisers fail. Each event requires a detailed roadmap with clear goals, budgets, timelines, volunteer roles, and promotion tactics. Without a strategic annual plan, youth events and activities quickly become disorganized. Unfortunately, it's quite common to set unrealistic goals and weak incentives. Poor planning also means poor communication. Tasks overlap, deadlines get missed, enthusiasm wanes, and you end up with a complete disaster. Solution: Our candy will make your fundraiser a smashing success. There's no need for meticulous order tracking and long inventory spreadsheets. You get one shipment, set your own prices, and sell a product everyone knows (and loves!). There is no long approval process or confusing logistics to handle. Plus, it's highly flexible. Kids and volunteers can sell on the go and start raising money to support youth activities and events. We're here to simplify fundraising for you with a tired-and-true favorite that always delivers.",
      image: "/assets/images/blog1.png",
      date: "Jul 06, 2021",
      author: "Marie Caphlish",
      wrapper: false,
    },
    {
      id: "3",
      title: "Poor Products",
      description:
        "This might be one of the most difficult challenges for children, parents, coaches, and community members alike. Trying to garner enthusiasm for a poor product is an insurmountable obstacle. Quality can make or break your fundraising efforts. So when a donor contributes, they expect to receive a product that aligns with the value they're offering. Low-quality merchandise means low sales, leftover inventory, and a damaged reputation. Not only do buyers feel misled, but they're also less likely to participate in future fundraisers. This is why it's so important to invest in quality goods. A low-cost product that is highly desirable can make all the difference. Solution: Let's face it. No one really wants to buy overpriced wrapping paper or stale cookie dough. Much less buying a novelty item that is poorly made and that they will never use. Candy is an easy \"yes.\" It moves fast, so you're not stuck with leftover inventory. You have high profit margins, so teams and club members get to keep more of the money raised. Plus, it's a tested product, which means no surprises and no complaints. Best of all, children, parents, and volunteers feel more confident selling something they actually believe in. Offering people a treat they're happy to pay for takes away the pressure that comes with traditional fundraising. All in all, it's a winning combination. Ready to raise more, with less stress? Reach out today and find out how easy it is to get started!",
      image: "/assets/images/blog1.png",
      date: "Jul 06, 2021",
      author: "Marie Caphlish",
      wrapper: false,
    },
  ],
  sideBarData: [
    {
      title: "Fundraiser Fatigue",
      description:
        "Fundraiser fatigue is not uncommon amongst families. Everyone's been there: \"another catalog, another theme, another guilt trip…\" How often do you see parents sigh and shake their heads when their kid walks through the door with yet another thing to raise funds for? The financial pressure is immense as more and more parents experience burnout from all these campaigns. This is especially prevalent when there is more than one child's activities to deal with. Ordering, selling, and keeping track of multiple fundraising efforts wears everyone out. It's always a hassle asking the same family members and neighbors over and over again. This is especially true when the products aren't that great, not to say entirely useless. Solution: This is where candy fundraising stands out. There is no clutter involved, no complicated order forms, and definitely no awkward pitches to family and friends. You're offering something everyone already enjoys. Instead of trying to juggle five fundraisers all at once, you can focus on the one that actually works. Candy is easy to carry, and it delivers high profit margins.",
      image: "/assets/images/blog1.png",
    },
    {
      title: "Fundraiser Fatigue",
      description:
        "Fundraiser fatigue is not uncommon amongst families. Everyone's been there: \"another catalog, another theme, another guilt trip…\" How often do you see parents sigh and shake their heads when their kid walks through the door with yet another thing to raise funds for? The financial pressure is immense as more and more parents experience burnout from all these campaigns. This is especially prevalent when there is more than one child's activities to deal with. Ordering, selling, and keeping track of multiple fundraising efforts wears everyone out. It's always a hassle asking the same family members and neighbors over and over again. This is especially true when the products aren't that great, not to say entirely useless. Solution: This is where candy fundraising stands out. There is no clutter involved, no complicated order forms, and definitely no awkward pitches to family and friends. You're offering something everyone already enjoys. Instead of trying to juggle five fundraisers all at once, you can focus on the one that actually works. Candy is easy to carry, and it delivers high profit margins.",
      image: "/assets/images/blog1.png",
    },
  ],
};

// Function to get blog data by ID
export const getBlogById = (id: string) => {
  return blogPageData.blogData.find(blog => blog.id === id);
};

// Function to get all blog IDs for static generation
export const getAllBlogIds = () => {
  return blogPageData.blogData.map(blog => blog.id);
};

// Terms and Conditions page data
export const termsPageData = {
  pageTitle: "Terms & Conditions",
  breadcrumbText: "Terms & Conditions",
  blogData: [
    {
      id: "1",
      title: "1. Description of Services",
      description:
        "1.1 The Company provides a virtual fundraising platform that enables registered 501(c)(3) charitable organizations (\"Organizations\") to raise funds through the sale of Licorice Ropes Candy in 3, 4, 7, or 12 packs (no mixing or matching of flavors). 1.2 For Organizations, we provide a digital media kit with promotional materials and best practice guidelines to support fundraising campaigns. At the Organization's request, we may provide a box of individually packaged Product samples, based on the number of expected participants, if the campaign is scheduled at least one (1) month in advance. Campaigns scheduled with at least three (3) days' notice will not include samples. 1.3 Consumers may purchase Products directly through the Website to support fundraising campaigns or for personal use. 1.4 The Company reserves the right to modify, suspend, or discontinue any aspect of the Website or services at any time, with or without notice, at its sole discretion.",
      image: "/assets/images/blog1.png",
      date: "Jul 06, 2021",
      author: "Legal Team",
      wrapper: true,
    },
    {
      id: "2",
      title: "2. Eligibility Requirements",
      description:
        "2.1 Organizations: To participate in a fundraising campaign, an Organization must: (a) Be a registered 501(c)(3) charitable organization under the Internal Revenue Code, in good standing; (b) Provide its legal name, federal tax identification number, contact person's name, phone number, and mailing address; and (c) Agree to use funds raised for lawful purposes aligned with its charitable mission. 2.2 Consumers: To place an order, a consumer must: (a) Be at least 18 years of age; (b) Provide accurate contact and payment information; and (c) Comply with these Terms and applicable laws. 2.3 The Company may verify an Organization's 501(c)(3) status through IRS records or other reliable sources. We reserve the right to refuse service to any user who fails to meet eligibility requirements or provides false information.",
      image: "/assets/images/blog1.png",
      date: "Jul 06, 2021",
      author: "Legal Team",
      wrapper: false,
    },
    {
      id: "3",
      title: "3. Payment, Refunds, and Delivery",
      description:
        "3.1 Payment: All transactions are processed through Shopify's secure payment platform. We accept major credit cards, including Visa, Mastercard, American Express, and Discover. Payment is required at the time of order placement. 3.2 Refunds and Exchanges: We offer a one-time exchange policy. If you are unsatisfied with your order, you may exchange it for a similar Product of the same quantity within fourteen (14) days of delivery, subject to availability. Contact us at 919-701-9321 to initiate an exchange. No cash refunds will be provided. 3.3 Delivery: Shipping costs are calculated at checkout and excluded from fundraising commissions. Tracking information will be provided for all orders. Delivery times vary based on location and carrier. The Company is not liable for delays caused by carriers, incorrect shipping information, or events beyond our control. 3.4 Taxes: Applicable sales taxes are added to orders as required by law and are the responsibility of the consumer.",
      image: "/assets/images/blog1.png",
      date: "Jul 06, 2021",
      author: "Legal Team",
      wrapper: false,
    },
  ],
  sideBarData: [
    {
      title: "Contact Information",
      description:
        "If You Have Questions, Concerns, Or Requests Related To This Policy, Please Contact: Landmark Foods LLC, 4383 Gadsden Farm Dr, Summerville, SC 29485, Phone: 910-701-9321",
      image: "/assets/images/blog1.png",
    },
  ],
};

// Privacy Policy page data
export const privacyPageData = {
  pageTitle: "Privacy Policy",
  breadcrumbText: "Privacy Policy",
  blogData: [
    {
      id: "1",
      title: "1. Scope of this Policy",
      description:
        "1.1 This Policy Applies To All Users Of The Website, Including: (a) Registered 501(c)(3) charitable organizations (\"Organizations\") participating in virtual fundraising campaigns; (b) Consumers purchasing Licorice Ropes Candy (\"Products\") through the Website; and (c) Visitors browsing the Website. 1.2 This Policy covers personal information, defined as any information that identifies or can be used to identify an individual, collected through the Website or our services. 1.3 This Policy does not apply to information collected offline or through third-party websites linked from our Website, which may have their own privacy practices.",
      image: "/assets/images/blog1.png",
      date: "Jul 06, 2021",
      author: "Legal Team",
      wrapper: true,
    },
    {
      id: "2",
      title: "2. Information We Collect",
      description:
        "2.1 Information Provided by Users: We collect the following personal information: (a) From Organizations: Legal organization name, contact person's name, phone number, mailing address, and federal tax identification number, provided during registration for fundraising campaigns. (b) From Consumers: Name, email address, phone number, mailing address, and payment information (e.g., credit card details), provided when placing an order. 2.2 Automatically Collected Information: We collect usage data through cookies and similar tracking technologies, including: (a) IP address, browser type, device information, and operating system; (b) Website navigation patterns, such as pages visited and time spent; and (c) Affiliate tracking data to attribute sales to specific fundraising campaigns. 2.3 Third-Party Information: We may receive information from third parties, such as Shopify (our payment processor) or affiliate marketing software providers, to facilitate order processing and commission tracking.",
      image: "/assets/images/blog1.png",
      date: "Jul 06, 2021",
      author: "Legal Team",
      wrapper: false,
    },
    {
      id: "3",
      title: "3. How We Use Your Information",
      description:
        "3.1 We use personal information for the following purposes: (a) To process and fulfill consumer orders, including payment processing, shipping, and customer support; (b) To administer virtual fundraising campaigns, including verifying Organization eligibility, tracking sales, and issuing commission payments; (c) To communicate with users about orders, campaigns, or account updates (e.g., order confirmations, fundraising tips); (d) To send promotional emails or marketing materials from the Company or its affiliates, subject to applicable laws and your consent; (e) To analyze Website usage and improve our services, user experience, and marketing strategies; and (f) To comply with legal obligations, such as IRS regulations for 501(c)(3) organizations or consumer protection laws. 3.2 We may use anonymized or aggregated data (which does not identify individuals) for analytics, reporting, or promotional purposes.",
      image: "/assets/images/blog1.png",
      date: "Jul 06, 2021",
      author: "Legal Team",
      wrapper: false,
    },
  ],
  sideBarData: [
    {
      title: "Contact Information",
      description:
        "If You Have Questions, Concerns, Or Requests Related To This Policy, Please Contact: Landmark Foods LLC, 4383 Gadsden Farm Dr, Summerville, SC 29485, Phone: 910-701-9321",
      image: "/assets/images/blog1.png",
    },
  ],
}; 